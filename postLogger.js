//  Requirement 5: Custom middleware that logs every successful POST request
// Logs: timestamp + user ID who made the request

function postLogger(req, res, next) {
  if (req.method !== "POST") return next();

  // Intercept the response to log only on success (2xx)
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const timestamp = new Date().toISOString();
      const userId = req.session?.userId || "غير مسجل";
      const path = req.originalUrl;

      console.log(
        `[POST LOG] | الوقت: ${timestamp} | المسار: ${path} | المستخدم: ${userId}`
      );
    }
    return originalJson(body);
  };

  next();
}

module.exports = postLogger;
