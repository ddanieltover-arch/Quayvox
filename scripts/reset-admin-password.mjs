import { readFileSync, writeFileSync } from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const password = process.argv[2] || crypto.randomBytes(9).toString('base64url');
const hash = await bcrypt.hash(password, 10);

const envPath = '.env';
let env = readFileSync(envPath, 'utf8');

// Quote hash so $2a$10$... is not expanded by dotenv/Vercel
const quoted = `'${hash}'`;

if (/^ADMIN_PASSWORD_HASH=/m.test(env)) {
  env = env.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${quoted}`);
} else {
  env += `\nADMIN_PASSWORD_HASH=${quoted}\n`;
}

writeFileSync(envPath, env);

const ok = await bcrypt.compare(password, hash);
console.log('Updated ADMIN_PASSWORD_HASH in .env (quoted to protect $ characters)');
console.log('Verify hash compare:', ok);
console.log('');
console.log('Login with:');
console.log('  email:    (ADMIN_EMAIL in .env)');
console.log('  password:', password);
console.log('');
console.log('Restart vercel dev after this change.');
