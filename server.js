const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const isDev = process.argv.includes("--dev");
const port = Number(process.env.PORT) || (isDev ? 3000 : 8080);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject"
};

function exists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (_error) {
    return false;
  }
}

function getCacheControl(filePath) {
  if (isDev) {
    return "no-store";
  }

  if (filePath.endsWith(".html")) {
    return "no-cache";
  }

  return "public, max-age=604800";
}

function resolveFileFromUrl(rawUrlPath) {
  const sanitizedPath = decodeURIComponent(rawUrlPath.split("?")[0]).replace(/\0/g, "");
  const normalizedPath = path.normalize(sanitizedPath).replace(/^([/\\])+/, "");
  let candidatePath = path.join(rootDir, normalizedPath);

  if (candidatePath.endsWith(path.sep)) {
    candidatePath = path.join(candidatePath, "index.html");
  }

  if (exists(candidatePath) && fs.statSync(candidatePath).isDirectory()) {
    candidatePath = path.join(candidatePath, "index.html");
  }

  if (!exists(candidatePath)) {
    const hasExtension = path.extname(candidatePath) !== "";
    if (!hasExtension) {
      candidatePath = path.join(rootDir, "index.html");
    } else {
      return null;
    }
  }

  const absoluteCandidate = path.resolve(candidatePath);
  if (!absoluteCandidate.startsWith(path.resolve(rootDir))) {
    return null;
  }

  return absoluteCandidate;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  let filePath;
  try {
    filePath = resolveFileFromUrl(req.url || "/");
  } catch (_error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const cacheControl = getCacheControl(filePath);

  const headers = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl
  };

  if (req.method === "HEAD") {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("open", () => {
    res.writeHead(200, headers);
  });
  stream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Internal Server Error");
  });
  stream.pipe(res);
});

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port} (${isDev ? "dev" : "prod"})`);
});
