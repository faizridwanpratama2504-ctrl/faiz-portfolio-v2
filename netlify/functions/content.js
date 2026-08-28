// Backend porto: menyimpan & mengambil konten lewat Netlify Blobs.
// GET  /api/content  -> siapa saja boleh baca (dipakai halaman publik / "user")
// POST /api/content  -> hanya boleh kalau login Netlify Identity (dipakai mode "developer")

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const store = openStore('portfolio-content');

  if (event.httpMethod === 'GET') {
    const raw = await store.get('main');
    return { statusCode: 200, headers, body: raw || 'null' };
  }

  if (event.httpMethod === 'POST') {
    // event.clientContext.user otomatis terisi Netlify kalau request membawa
    // header Authorization: Bearer <token identity yang valid>.
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

    await store.set('main', JSON.stringify(payload));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
