// Backend porto: menyajikan gambar yang tersimpan di Netlify Blobs.
// GET /api/image?key=img_xxx -> siapa saja boleh baca (foto profil, cover, dll bersifat publik)

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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const key = event.queryStringParameters && event.queryStringParameters.key;
  if (!key || !/^img_[a-z0-9_]+$/i.test(key)) {
    return { statusCode: 400, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'key tidak valid.' }) };
  }

  const store = openStore('portfolio-images');
  const result = await store.getWithMetadata(key, { type: 'buffer' });

  if (!result) {
    return { statusCode: 404, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Gambar tidak ditemukan.' }) };
  }

  const contentType = (result.metadata && result.metadata.contentType) || 'image/jpeg';

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    body: result.data.toString('base64'),
    isBase64Encoded: true
  };
};
