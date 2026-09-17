"use strict";

(() => {
  const ENDPOINT = "https://evane-github-io.vercel.app/api/visit";
  const KEY = "visit_notified_v2";

  try {
    if (sessionStorage.getItem(KEY) === "1") return;
  } catch {}

  const ua = navigator.userAgent || "";

  function samsungName(model) {
    const code = String(model || "").toUpperCase();
    const map = [
      [/^SM-S938/, "Samsung Galaxy S25 Ultra"],
      [/^SM-S936/, "Samsung Galaxy S25+"],
      [/^SM-S931/, "Samsung Galaxy S25"],
      [/^SM-S928/, "Samsung Galaxy S24 Ultra"],
      [/^SM-S926/, "Samsung Galaxy S24+"],
      [/^SM-S921/, "Samsung Galaxy S24"],
      [/^SM-S918/, "Samsung Galaxy S23 Ultra"],
      [/^SM-S916/, "Samsung Galaxy S23+"],
      [/^SM-S911/, "Samsung Galaxy S23"],
      [/^SM-S908/, "Samsung Galaxy S22 Ultra"],
      [/^SM-S906/, "Samsung Galaxy S22+"],
      [/^SM-S901/, "Samsung Galaxy S22"]
    ];
    const hit = map.find(([re]) => re.test(code));
    return hit ? `${hit[1]} (${model})` : model;
  }

  function androidModelFromUA() {
    const match = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\s+Build\/|;|\))/i);
    if (!match) return "";
    let model = match[1].replace(/^wv\s*/i, "").trim();
    model = model.replace(/^([a-z]{2}-[A-Z]{2};\s*)/i, "").trim();
    return samsungName(model);
  }

  function browserName() {
    if (/EdgiOS|Edg\//i.test(ua)) return "Edge";
    if (/CriOS|Chrome\//i.test(ua)) return "Chrome";
    if (/FxiOS|Firefox\//i.test(ua)) return "Firefox";
    if (/OPiOS|OPR\//i.test(ua)) return "Opera";
    if (/Safari\//i.test(ua)) return "Safari";
    return "Browser";
  }

  function deviceType() {
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? "Android phone" : "Android tablet";
    if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Linux/i.test(ua)) return "Linux PC";
    return "Unknown device";
  }

  function osVersion() {
    let m;
    if (/iPhone|iPad|iPod/i.test(ua)) {
      m = ua.match(/OS\s([0-9_]+)/i);
      return m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
    }
    if (/Android/i.test(ua)) {
      m = ua.match(/Android\s([0-9.]+)/i);
      return m ? `Android ${m[1]}` : "Android";
    }
    if (/Mac OS X/i.test(ua)) {
      m = ua.match(/Mac OS X\s([0-9_\.]+)/i);
      return m ? `macOS ${m[1].replace(/_/g, ".")}` : "macOS";
    }
    if (/Windows NT 10\.0/i.test(ua)) return "Windows 10/11";
    if (/Windows/i.test(ua)) return "Windows";
    return "Unknown OS";
  }

  async function detectModel() {
    try {
      if (navigator.userAgentData?.getHighEntropyValues) {
        const info = await navigator.userAgentData.getHighEntropyValues(["model", "platform", "platformVersion"]);
        if (info.model) return samsungName(info.model);
      }
    } catch {}

    if (/Android/i.test(ua)) {
      return androidModelFromUA() || "Android device — exact model not exposed by browser";
    }
    if (/iPhone/i.test(ua)) {
      return "iPhone — exact model hidden by iOS/Safari";
    }
    if (/iPad/i.test(ua)) {
      return "iPad — exact model hidden by iPadOS/Safari";
    }
    if (/Macintosh|Mac OS X/i.test(ua)) {
      return "Mac — exact MacBook/iMac model hidden by browser";
    }
    if (/Windows/i.test(ua)) {
      return "Windows device — exact hardware model not exposed by browser";
    }
    return "Exact model not exposed by browser";
  }

  async function sendVisit() {
    const model = await detectModel();
    const screenInfo = `${screen.width || "?"}×${screen.height || "?"} @${window.devicePixelRatio || 1}x`;
    const device = `${deviceType()} / ${browserName()}`;

    fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: "Love Website",
        device,
        model,
        os: osVersion(),
        screen: screenInfo,
        referrer: document.referrer || "Direct visit"
      })
    }).then((response) => {
      if (!response.ok) return;
      try { sessionStorage.setItem(KEY, "1"); } catch {}
    }).catch(() => {});
  }

  sendVisit();
})();
