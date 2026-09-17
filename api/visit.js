function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (origin === 'https://mohamed1med2.github.io') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function clean(value, max = 180) {
  if (typeof value !== 'string') return 'Unknown';
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) || 'Unknown';
}

function friendlyDevice(userAgent) {
  const ua = String(userAgent || '');
  let device = 'Desktop';
  if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (/iPad/i.test(ua)) device = 'iPad';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) device = 'Mac';
  else if (/Windows/i.test(ua)) device = 'Windows PC';
  else if (/Linux/i.test(ua)) device = 'Linux';

  let browser = 'Browser';
  if (/EdgiOS|Edg\//i.test(ua)) browser = 'Edge';
  else if (/CriOS|Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/FxiOS|Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome|CriOS|Edg\//i.test(ua)) browser = 'Safari';

  return `${device} / ${browser}`;
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, service: 'visit-hook' });
  }

  const origin = req.headers.origin || '';
  if (origin && origin !== 'https://mohamed1med2.github.io') {
    return res.status(403).json({ ok: false });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return res.status(503).json({ ok: false, setup: 'missing_webhook' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const now = new Date();
  const device = clean(body.device || friendlyDevice(req.headers['user-agent']), 120);
  const model = clean(body.model || 'Exact model not exposed by browser', 220);
  const os = clean(body.os || 'Unknown OS', 120);
  const screen = clean(body.screen || 'Unknown', 80);
  const referrer = clean(body.referrer || req.headers.referer || 'Direct visit', 180);
  const page = clean(body.page || 'Love Website', 120);

  const payload = {
    username: 'Love Website',
    embeds: [{
      title: '💗 New Website Visit',
      color: 0xE96097,
      fields: [
        { name: '🕒 Time', value: now.toLocaleString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC' },
        { name: '📱 Device', value: device },
        { name: '📲 Device Model', value: model },
        { name: '⚙️ OS', value: os },
        { name: '🖥️ Screen', value: screen },
        { name: '🔗 Referrer', value: referrer },
        { name: '🌐 Page', value: page }
      ],
      footer: { text: 'Device details are limited to what the browser exposes ♡' },
      timestamp: now.toISOString()
    }]
  };

  try {
    const discord = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!discord.ok) {
      return res.status(502).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
