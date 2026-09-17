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
  const device = clean(body.device || req.headers['user-agent'] || 'Unknown', 220);
  const referrer = clean(body.referrer || 'Direct visit', 180);
  const page = clean(body.page || 'Love Website', 120);

  const payload = {
    username: 'Love Website',
    embeds: [{
      title: '💗 New Website Visit',
      color: 0xE96097,
      fields: [
        { name: '🕒 Time', value: now.toLocaleString('en-GB', { timeZone: 'UTC', hour12: false }) + ' UTC' },
        { name: '📱 Device', value: device },
        { name: '🔗 Referrer', value: referrer },
        { name: '🌐 Page', value: page }
      ],
      footer: { text: 'A little visit to your love website ♡' },
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
