// Backend porto: hitungan "clap" ala Medium di halaman detail proyek.
// GET  /api/clap?id=proyek-x  -> siapa saja boleh baca jumlah clap
// POST /api/clap { id, amount } -> siapa saja boleh nambah clap (tidak perlu login, ini cuma apresiasi pembaca)
//   amount dibatasi maksimal 10 per klik & id dibatasi supaya tidak disalahgunakan buat menyimpan data lain.

const { getStore } = require('@netlify/blobs');

// Beberapa environment gagal auto-configure Netlify Blobs (bug platform yang cukup
// sering terjadi, terutama kalau site pakai "base directory" custom). Kalau itu
// terjadi, kasih siteID & token manual lewat environment variable BLOBS_SITE_ID
// & BLOBS_TOKEN (isi di Project configuration -> Environment variables).
function openStore(name) {
  if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
    return getStore({ name, siteID: process.env.BLOBS_SITE_ID, token: process.env.BLOBS_TOKEN });
  }
  return getStore(name);
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const store = openStore('portfolio-claps');

  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id wajib diisi.' }) };
    const raw = await store.get(id);
    return { statusCode: 200, headers, body: JSON.stringify({ id, count: raw ? parseInt(raw, 10) || 0 : 0 }) };
  }

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON tidak valid.' }) };
    }
    const id = payload && payload.id;
    let amount = payload && Number(payload.amount);
    if (!id || typeof id !== 'string' || id.length > 100) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'id tidak valid.' }) };
    }
    if (!Number.isFinite(amount) || amount < 1) amount = 1;
    amount = Math.min(Math.floor(amount), 10);

    const raw = await store.get(id);
    const current = raw ? parseInt(raw, 10) || 0 : 0;
    const next = current + amount;
    await store.set(id, String(next));
    return { statusCode: 200, headers, body: JSON.stringify({ id, count: next }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
