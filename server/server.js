/* =========================================
   FRONTEND STATIC FILES
========================================= */

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const root =
  path.join(
    __dirname,
    ".."
  );

const dist =
  path.join(
    root,
    "dist"
  );

app.use(
  express.static(dist)
);

/* =========================================
   REACT SPA FALLBACK
========================================= */

/*
 * React owns browser-side routes such as:
 *
 * /search
 * /tourism/leisure
 * /tourism/leisure/results
 * /tourism/education
 * /tourism/education/results
 * /planner
 * /visa
 * /hotels
 * /activities
 * /esim
 * /transfers
 * /luggage
 * /assistance
 * /alerts
 *
 * When the browser refreshes one of these
 * URLs, Express must return index.html so
 * React can take over routing.
 *
 * API routes are deliberately excluded.
 */

app.get(
  /^\/(?!api(?:\/|$)).*/,
  (req, res, next) => {
    res.sendFile(
      path.join(
        dist,
        "index.html"
      ),
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  }
);

/* =========================================
   CENTRALIZED 404 HANDLER
========================================= */

app.use(
  notFoundHandler
);

/* =========================================
   CENTRALIZED ERROR HANDLER
========================================= */

app.use(
  errorHandler
);
