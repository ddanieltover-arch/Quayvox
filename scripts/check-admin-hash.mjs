import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';

const raw = readFileSync('.env', 'utf8');
const line = raw.split(/\r?\n/).find((l) => l.startsWith('ADMIN_PASSWORD_HASH='));
const fileHash = line.slice('ADMIN_PASSWORD_HASH='.length).replace(/^['"]|['"]$/g, '');
console.log('file hash length', fileHash.length);
console.log('file hash prefix', fileHash.slice(0, 12));

// dotenv-style expansion of $VAR (undefined -> empty)
const expanded = fileHash.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, k) => process.env[k] ?? '');
console.log('expanded length', expanded.length);
console.log('expanded prefix', expanded.slice(0, 20));
console.log('unchanged by expand?', expanded === fileHash);

const candidates = ['QuayvoxAdmin2026!', '10$tbsv2JaCnJI', 'YOUR_NEW_PASSWORD'];
for (const p of candidates) {
  console.log(
    JSON.stringify(p),
    'file=',
    await bcrypt.compare(p, fileHash),
    'expanded=',
    await bcrypt.compare(p, expanded)
  );
}
