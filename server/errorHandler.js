export class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    options = {}
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode =
      statusCode;

    this.code =
      options.code ||
      null;

    this.details =
      options.details ||
      null;

    this.expose =
      options.expose ??
      statusCode < 500;

    this.isOperational = true;

    Error.captureStackTrace(
      this,
      AppError
    );
  }
}

export function notFoundHandler(
  req,
  res,
  _next
) {
  if (
    req.path.startsWith(
      "/api/"
    )
  ) {
    return res.status(404).json({
      success: false,
      error:
        "API route not found.",
      path:
        req.path,
    });
  }

  return res.status(404).json({
    success: false,
    error:
      "Page not found.",
  });
}

export function errorHandler(
  error,
  req,
  res,
  _next
) {
  const statusCode =
    Number.isInteger(
      error?.statusCode
    )
      ? error.statusCode
      : 500;

  const isProduction =
    process.env.NODE_ENV ===
    "production";

  const isApiRequest =
    req.path.startsWith(
      "/api/"
    );

  if (error?.name === "SyntaxError") {
    return res.status(400).json({
      success: false,
      error:
        "Invalid request body.",
      code:
        "INVALID_JSON",
    });
  }

  if (
    error?.type ===
    "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      error:
        "Invalid request body.",
      code:
        "INVALID_JSON",
    });
  }

  console.error(
    "[FlyMatrix Error]",
    {
      method:
        req.method,
      path:
        req.path,
      statusCode,
      message:
        error?.message,
      stack:
        error?.stack,
    }
  );

  if (!isApiRequest) {
    return res.status(statusCode).json({
      success: false,
      error:
        isProduction
          ? "Internal server error."
          : error?.message ||
            "Internal server error.",
    });
  }

  const response = {
    success: false,

    error:
      error?.expose ||
      !isProduction
        ? error?.message ||
          "Internal server error."
        : "Internal server error.",
  };

  if (error?.code) {
    response.code =
      error.code;
  }

  if (
    error?.details &&
    (
      error?.expose ||
      !isProduction
    )
  ) {
    response.details =
      error.details;
  }

  return res
    .status(statusCode)
    .json(response);
}

export default {
  AppError,
  notFoundHandler,
  errorHandler,
};
