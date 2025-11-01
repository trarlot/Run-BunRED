/* eslint-disable no-console */
/*
  Downloads all trainer front sprites from pret/pokeemerald into public/assets/trainer
  Usage:
    node scripts/fetch-trainers.js
  Optional (to avoid rate limits): set GITHUB_TOKEN in env.
*/

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'trainer');
const API_URL = 'https://api.github.com/repos/pret/pokeemerald/contents/graphics/trainers/front_pics';

function request(url) {
  const headers = {
    'User-Agent': 'trainer-fetch-script',
    'Accept': 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers }, (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body: buf });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${buf.toString()}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function getJson(url) {
  const res = await request(url);
  try {
    return JSON.parse(res.body.toString());
  } catch (e) {
    throw new Error('Failed to parse JSON');
  }
}

async function downloadFile(url, dest) {
  const headers = { 'User-Agent': 'trainer-fetch-script' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // redirect
          return resolve(downloadFile(res.headers.location, dest));
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Download failed ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      })
      .on('error', reject);
  });
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('📥 Fetching trainer sprite list from pret/pokeemerald...');
  const list = await getJson(API_URL);
  const pngs = list.filter((f) => f.type === 'file' && f.name.endsWith('.png'));
  console.log(`✅ Found ${pngs.length} sprites. Downloading into ${OUT_DIR} ...`);

  let count = 0;
  for (const file of pngs) {
    const dest = path.join(OUT_DIR, file.name);
    await downloadFile(file.download_url, dest);
    count++;
    process.stdout.write(`  • Saved ${file.name} (${count}/${pngs.length})\n`);
  }
  console.log('🎉 Done.');
}

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
