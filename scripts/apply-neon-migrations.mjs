import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const root = process.cwd();

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv(join(root, '.env'));
if (!env.DATABASE_URL) {
  console.error('DATABASE_URL missing in .env');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(readFileSync(join(root, 'neon/migrations/001_init.sql'), 'utf8'));
console.log('applied neon/migrations/001_init.sql');
await client.query(readFileSync(join(root, 'neon/migrations/002_seed_shipments.sql'), 'utf8'));
console.log('applied neon/migrations/002_seed_shipments.sql');
const result = await client.query('select count(*)::int as n from shipments');
console.log('shipments=', result.rows[0].n);
await client.end();
