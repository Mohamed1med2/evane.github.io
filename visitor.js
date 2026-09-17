"use strict";

(() => {
  const ENDPOINT = "https://evane-github-io.vercel.app/api/visit";
  const KEY = "visit_notified_v1";

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

  function appleScreenClass() {
    const sw = Math.min(screen.width || 0, screen.height || 0);
    const sh = Math.max(screen.width || 0, screen.height || 0);
    const dpr = Number(window.devicePixelRatio || 1);
    const key = `${sw}x${sh}@${dpr}`;
    const classes = {
      "440x956@3": "iPhone 16 Pro Max screen class",
      "402x874@3": "iPhone 16 Pro screen class",
      "430x932@3": "iPhone 14/15 Pro Max screen class",
      "393x852@3": "iPhone 14/15 Pro screen class",
      "428x926@3": "iPhone 12/13 Pro Max or 14 Plus screen class",
      "390x844@3": "iPhone 12/13/14 screen class",
      "375x812@3": "iPhone X/XS/11 Pro or 12/13 mini screen class",
      "414x896@2": "iPhone XR/11 screen class",
      "414x896@3": "iPhone XS Max/11 Pro Max screen class",
      "414x736@3": "iPhone Plus screen class",
      "375x667@2": "iPhone 6/7/8/SE screen class"
    };
    return classes[key] || `iPhone (${sw}×${sh} @${dpr}x)`;
  }

  async function detectModel() {
    try {
      if (navigator.userAgentData?.getHighEntropyValues) {
        const info = await navigator.userAgentData.getHighEntropyValues(["model", "platform"]);
        if (info.model) return samsungName(info.model);
      }
    } catch {}

    if (/Android/i.test(ua)) {
      return androidModelFromUA() || "Android device (model not exposed)";
    }
    if (/iPhone/i.test(ua)) {
      return `${appleScreenClass()} — Safari does not expose the exact iPhone model`;
    }
    if (/iPad/i.test(ua)) {
      return "iPad — browser does not expose the exact model";
    }
    if (/Macintosh|Mac OS X/i.test(ua)) {
      return "Mac — browser does not expose the exact MacBook/iMac model";
    }
    if (/Windows/i.test(ua)) {
      return "Windows device — exact hardware model not exposed";
    }
    return "Model not exposed by browser";
  }

  async function sendVisit() {
    const model = await detectModel();
    const screenInfo = `${screen.width || "?"}×${screen.height || "?"} @${window.devicePixelRatio || 1}x`;

    fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: "Love Website",
        model,
        screen: screenInfo
      })
    }).then((response) => {
      if (!response.ok) return;
      try { sessionStorage.setItem(KEY, "1"); } catch {}
    }).catch(() => {});
  }

  sendVisit();
})();
