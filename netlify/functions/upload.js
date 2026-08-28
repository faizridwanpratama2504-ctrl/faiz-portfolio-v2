// Backend porto: upload gambar (foto profil, cover hero, cover proyek) ke Netlify Blobs.
// POST /api/upload  -> hanya boleh kalau login Netlify Identity (mode "developer")
// Body: { dataUrl: "data:image/jpeg;base64,...." }
// Return: { key: "img_xxx" } — dipakai lewat GET /api/image?key=img_xxx

const { getStore } = require('@netlify/blobs');

const MAX_BYTES = 4_500_000; // ~4.5MB, longgar karena gambar sudah dikompres di browser sebelum dikirim

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const user = event.clientContext && event.clientContext.user;
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized — login sebagai developer dulu.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON tidak valid.' }) };
  }

  const dataUrl = payload && payload.dataUrl;
  const match = typeof dataUrl === 'string' && dataUrl.match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/);
  if (!match) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Format gambar tidak didukung. Pakai PNG/JPEG/WEBP/GIF.' }) };
  }

  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  if (buffer.length > MAX_BYTES) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Gambar terlalu besar. Perkecil dulu (maks ~4.5MB).' }) };
  }

  const store = getStore('portfolio-images');
  const key = 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);

  await store.set(key, buffer, { metadata: { contentType } });

  return { statusCode: 200, headers, body: JSON.stringify({ key }) };
};
