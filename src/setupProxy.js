const axios = require("axios");
const crypto = require("crypto");
const { createProxyMiddleware } = require("http-proxy-middleware");

const VERSION = "1.6.34";
const URL = "https://zingmp3.vn";
const SECRET_KEY = "2aa2d1c561e809b267f3638c4a307aab";
const API_KEY = "88265e23d4284f25963e6eedac8fbfa3";
const VIETNAM_IP = "113.161.72.15";

function getHash256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function getHmac512(str, key) {
  return crypto.createHmac("sha512", key).update(Buffer.from(str, "utf8")).digest("hex");
}

function hashParam(path, id, ctime) {
  return getHmac512(path + getHash256(`ctime=${ctime}id=${id}version=${VERSION}`), SECRET_KEY);
}

let cachedCookie = "";
let cookieExpiry = 0;

async function getCookie(forceRefresh = false) {
  if (!forceRefresh && cachedCookie && Date.now() < cookieExpiry) {
    return cachedCookie;
  }
  try {
    const res = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "vi,en;q=0.9",
        Referer: "https://zingmp3.vn/",
        "X-Forwarded-For": VIETNAM_IP,
        "X-Real-IP": VIETNAM_IP,
        "Client-IP": VIETNAM_IP,
      },
      timeout: 6000,
    });
    const cookies = res.headers["set-cookie"];
    if (cookies && cookies.length > 0) {
      cachedCookie = cookies.map((c) => c.split(";")[0]).join("; ");
      cookieExpiry = Date.now() + 1000 * 60 * 30; // 30 phút
      return cachedCookie;
    }
  } catch (err) {
    console.error("ZingMP3 Cookie fetch error:", err.message);
  }
  return cachedCookie || "";
}

async function getStreamUrl(songId) {
  let cookie = await getCookie();
  const ctime = String(Math.floor(Date.now() / 1000));
  const path = "/api/v2/song/get/streaming";
  const sig = hashParam(path, songId, ctime);

  const requestHeaders = {
    Cookie: cookie,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: "https://zingmp3.vn/",
    "X-Forwarded-For": VIETNAM_IP,
    "X-Real-IP": VIETNAM_IP,
    "Client-IP": VIETNAM_IP,
  };

  let res = await axios.get(`${URL}${path}`, {
    headers: requestHeaders,
    params: {
      id: songId,
      ctime: ctime,
      version: VERSION,
      apiKey: API_KEY,
      sig: sig,
    },
    timeout: 8000,
  });

  // Tự động thử lại nếu cookie hết hạn
  if (res.data?.err === -201 || !res.data?.data?.["128"]) {
    cookie = await getCookie(true);
    requestHeaders.Cookie = cookie;
    res = await axios.get(`${URL}${path}`, {
      headers: requestHeaders,
      params: {
        id: songId,
        ctime: ctime,
        version: VERSION,
        apiKey: API_KEY,
        sig: sig,
      },
      timeout: 8000,
    });
  }

  return res.data;
}

module.exports = function (app) {
  app.get(["/api/stream/:id", "/api/stream"], async (req, res) => {
    try {
      let id = req.query.id || req.params.id;
      if (id && id.endsWith(".mp3")) {
        id = id.slice(0, -4);
      }
      if (!id) {
        return res.status(400).json({ error: "Missing song id" });
      }

      const songData = await getStreamUrl(String(id));
      const streamUrl = songData?.data?.["128"];

      if (!streamUrl || streamUrl === "VIP") {
        return res.status(403).json({
          error: "Bài hát VIP hoặc không có link stream",
          data: songData,
        });
      }

      // 302 Chuyển hướng trực tiếp tới CDN tốc độ cao của Zing MP3
      return res.redirect(streamUrl);
    } catch (err) {
      console.error("Audio streaming error:", err?.response?.data || err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Proxy tất cả API data (home, chart, top100, lyrics, search...) về Zing MP3 API
  // Tự động gán Origin/Referer để vượt qua rào cản CORS khi truy cập từ iPhone (192.168.x.x)
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://api-zingmp3.vercel.app",
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader("Origin", "http://localhost:3000");
        proxyReq.setHeader("Referer", "http://localhost:3000");
      },
    })
  );
};
