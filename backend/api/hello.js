import allowCors from "./cors";

function handler(req, res) {
  res.json({
    message: "Hello from Vercel API!, alright. please please pleaze",
  });
}

export default allowCors(handler);
