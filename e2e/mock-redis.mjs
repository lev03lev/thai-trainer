// שרת דמה שמחקה את ה-REST API של Upstash (GET / SET) — לבדיקות מקומיות בלבד.
import http from "node:http";
const db = new Map();
http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (req.headers.authorization !== "Bearer test-token") {
        res.writeHead(401).end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      const [cmd, key, val] = JSON.parse(body || "[]");
      let result = null;
      if (cmd === "GET") result = db.get(key) ?? null;
      if (cmd === "SET") {
        db.set(key, val);
        result = "OK";
      }
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ result }));
    });
  })
  .listen(3199, () => console.log("mock redis on 3199"));
