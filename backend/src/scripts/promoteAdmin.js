import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSQLiteDB, initSQLite, SQLITE_DB_PATH } from '../config/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '../data/parkease_db.json');

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('\nUsage: npm run make-admin <email-address>\nExample: npm run make-admin driver@example.com\n');
  process.exit(1);
}

try {
  initSQLite();
  const db = getSQLiteDB();

  // Find user in SQLite
  const normalizedEmail = targetEmail.toLowerCase().trim();
  const row = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(normalizedEmail);

  if (!row) {
    console.error(`[Error] User with email "${targetEmail}" was not found in SQLite database.`);
    const allUsers = db.prepare('SELECT email, role FROM users').all();
    console.log('Existing registered users in SQLite:');
    allUsers.forEach(u => console.log(` - ${u.email} (${u.role || 'user'})`));
    process.exit(1);
  }

  const doc = JSON.parse(row.data);
  doc.role = 'admin';
  doc.updatedAt = new Date().toISOString();

  // Update in SQLite
  db.prepare(`
    UPDATE users 
    SET role = 'admin', updatedAt = ?, data = ?
    WHERE lower(email) = ?
  `).run(doc.updatedAt, JSON.stringify(doc), normalizedEmail);

  // Sync to JSON backup file
  if (fs.existsSync(jsonPath)) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const u = (jsonData.users || []).find(u => (u.email || '').toLowerCase().trim() === normalizedEmail);
      if (u) {
        u.role = 'admin';
        u.updatedAt = doc.updatedAt;
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
      }
    } catch (_) {}
  }

  console.log(`\n======================================================`);
  console.log(`[SUCCESS] User "${doc.name}" (${doc.email}) is now an ADMIN in SQLite!`);
  console.log(`User ID: ${doc._id}`);
  console.log(`Role: ${doc.role}`);
  console.log(`Database: ${SQLITE_DB_PATH}`);
  console.log(`======================================================\n`);
} catch (err) {
  console.error('[Error] Failed to promote user in SQLite:', err.message);
  process.exit(1);
}
