export default function allowCors(handler) {
  return async (req, res) => {
    // 🚨 Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*"); // * allows all origins (not recommended for prod)
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS preflight requests (important for CORS)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}
