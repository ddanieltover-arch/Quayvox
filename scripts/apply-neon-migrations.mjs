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

const migrations = [
  '001_init.sql',
  '002_seed_shipments.sql',
  '003_shipment_geo.sql',
  '004_shipment_party_details.sql',
  '005_quayvox_carrier.sql',
  '006_unified_addresses.sql',
];

await client.connect();
for (const file of migrations) {
  const path = join(root, 'neon/migrations', file);
  await client.query(readFileSync(path, 'utf8'));
  console.log(`applied neon/migrations/${file}`);
}
const result = await client.query('select count(*)::int as n from shipments');
console.log('shipments=', result.rows[0].n);
await client.end();
