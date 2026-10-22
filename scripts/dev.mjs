/** src를 수정하면 재생성하고 브라우저를 갱신하는 로컬 전용 서버입니다. */
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { buildSite, root, output, legacyRoutes } from "./build.mjs";
await buildSite();
const clients = new Set();
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/__updates") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    });
    res.write(": ready\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  if (url.pathname === "/favicon.ico") {
    res.writeHead(302, { Location: "/assets/brand/favicon.svg" });
    res.end();
    return;
  }
  const old = url.pathname.slice(1);
  if (legacyRoutes[old]) {
    res.writeHead(302, { Location: "/" + legacyRoutes[old] + url.search });
    res.end();
    return;
  }
  let file;
  try {
    file = path.resolve(
      output,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (!file.startsWith(output + path.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    let bytes = await fsp.readFile(file);
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream",
    );
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    if (file.endsWith(".html"))
      bytes = bytes
        .toString("utf8")
        .replace(
          "</body>",
          '<script>new EventSource("/__updates").onmessage=()=>location.reload();</script></body>',
        );
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("파일을 찾을 수 없습니다.");
  }
});
server.listen(Number(process.env.PORT || 4175), "127.0.0.1", () =>
  console.log(`로컬 미리보기: http://localhost:${process.env.PORT || 4175}/`),
);
let timer,
  running = false,
  pending = false;
async function rebuild() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  try {
    await buildSite();
    clients.forEach((res) => res.write("data: reload\n\n"));
  } catch (error) {
    console.error("수정 내용 확인:", error.message);
  } finally {
    running = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  }
}
const watcher = fs.watch(path.join(root, "src"), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 300);
});
process.on("SIGINT", () => {
  watcher.close();
  clients.forEach((res) => res.end());
  server.close(() => process.exit(0));
});
