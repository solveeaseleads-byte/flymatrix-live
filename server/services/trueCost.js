export function calculateTrueCost(
  offer = {},
  options = {}
) {
  const baseFare =
    Number(
      offer?.price?.amount ??
      offer?.price ??
      0
    );

  const baggageCost =
    Number(
      options.baggageCost ??
      offer?.baggageCost ??
      0
    );

  const stopPenalty =
    Number(
      options.stopPenalty ??
      Math.max(
        0,
        Number(
          offer?.stops || 0
        )
      ) * 10
    );

  const longJourneyPenalty =
    Number(
      options.longJourneyPenalty ||
      0
    );

  const comparableCost =
    baseFare +
    baggageCost +
    stopPenalty +
    longJourneyPenalty;

  const stops =
    Number(
      offer?.stops || 0
    );

  const connectionRisk =
    stops > 1
      ? "higher"
      : stops === 1
      ? "moderate"
      : "lower";

  return {
    baseFare,
    baggageCost,
    stopPenalty,
    longJourneyPenalty,
    comparableCost,
    connectionRisk,
    confidence:
      "planning estimate"
  };
}
