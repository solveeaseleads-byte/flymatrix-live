import {
  Router
} from "express";

import crypto from "node:crypto";

import { config }
  from "../config.js";

import {
  getSupabase
} from "../services/supabase.js";

const router =
  Router();

router.post(
  "/",
  async (req, res) => {
    const {
      email,
      amount,
      metadata = {}
    } = req.body || {};

    const numericAmount =
      Number(amount);

    if (
      !email ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Valid email and amount are required."
      });
    }

    if (
      !config.paystackSecretKey
    ) {
      return res.status(503).json({
        success: false,
        error:
          "Paystack is not configured."
      });
    }

    const reference =
      `FM-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    try {
      const response =
        await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${config.paystackSecretKey}`,

              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,

              amount:
                Math.round(
                  numericAmount * 100
                ),

              reference,

              metadata
            })
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.status
      ) {
        throw new Error(
          data?.message ||
          "Paystack initialization failed."
        );
      }

      await getSupabase()
        .from("payments")
        .insert({
          reference,
          email,
          amount:
            numericAmount,
          currency:
            "NGN",
          plan:
            metadata.plan ||
            null,
          status:
            "pending"
        });

      res.json({
        success: true,

        authorizationUrl:
          data.data
            .authorization_url,

        reference
      });
    } catch (error) {
      res.status(502).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

router.post(
  "/webhook",
  async (req, res) => {
    const signature =
      req.headers[
        "x-paystack-signature"
      ];

    const raw =
      req.rawBody ||
      JSON.stringify(
        req.body
      );

    if (
      !config.paystackSecretKey ||
      !signature
    ) {
      return res
        .status(401)
        .end();
    }

    const hash =
      crypto
        .createHmac(
          "sha512",
          config.paystackSecretKey
        )
        .update(raw)
        .digest("hex");

    if (
      hash !== signature
    ) {
      return res
        .status(401)
        .end();
    }

    try {
      const event =
        req.body;

      if (
        event.event ===
        "charge.success"
      ) {
        const reference =
          event.data?.reference;

        const email =
          event.data?.customer
            ?.email;

        const plan =
          event.data
            ?.metadata?.plan ||
          null;

        const supabase =
          getSupabase();

        await supabase
          .from("payments")
          .update({
            status:
              "success",

            paystack_event:
              event.event,

            updated_at:
              new Date().toISOString()
          })
          .eq(
            "reference",
            reference
          );

        if (
          email &&
          plan &&
          reference
        ) {
          await supabase
            .from(
              "subscriptions"
            )
            .upsert(
              {
                email,
                plan,
                status:
                  "active",
                payment_reference:
                  reference,

                started_at:
                  new Date().toISOString()
              },
              {
                onConflict:
                  "payment_reference"
              }
            );
        }
      }

      res.json({
        received: true
      });
    } catch (error) {
      res.status(500).json({
        received: false,
        error:
          error.message
      });
    }
  }
);

export default router;
