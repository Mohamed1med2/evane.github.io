"use strict";

(() => {
  const ENDPOINT = "https://evane-github-io.vercel.app/api/visit";
  const KEY = "visit_notified_v1";

  try {
    if (sessionStorage.getItem(KEY) === "1") return;
  } catch {}

  fetch(ENDPOINT, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: "Love Website" })
  }).then((response) => {
    if (!response.ok) return;
    try { sessionStorage.setItem(KEY, "1"); } catch {}
  }).catch(() => {});
})();
