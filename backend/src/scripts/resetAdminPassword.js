import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getSQLiteDB, initSQLite, SQLITE_DB_PATH, saveDocToSQLite } from '../config/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const targetEmail = (process.argv[2] || process.env.ADMIN_EMAIL?.split(',')[0] || 'asjeevaaslm@gmail.com').toLowerCase().trim();
const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD || '123456789';

console.log(`\n======================================================`);
console.log(`🔐 ParkEase Administrator Password Reset Script`);
console.log(`Target Admin: ${targetEmail}`);
console.log(`======================================================\n`);

try {
  initSQLite();
  const db = getSQLiteDB();

  // Find existing admin user
  const row = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(targetEmail);

  if (!row) {
    console.error(`[Error] Administrator with email "${targetEmail}" was not found.`);
    const existingAdmins = db.prepare('SELECT email, role FROM users WHERE role = "admin"').all();
    console.log('Existing Administrators in database:');
    existingAdmins.forEach(a => console.log(` - ${a.email}`));
    process.exit(1);
  }

  const userDoc = JSON.parse(row.data);

  // Hash new temporary password
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  // Update existing admin account
  userDoc.passwordHash = passwordHash;
  userDoc.role = 'admin';
  userDoc.mustChangePassword = true; // Temporary password flag
  userDoc.updatedAt = new Date().toISOString();

  // Update in SQLite
  saveDocToSQLite('users', userDoc);

  console.log(`[SUCCESS] Admin password for "${userDoc.name}" (${userDoc.email}) has been reset!`);
  console.log(`Database ID: ${userDoc._id}`);
  console.log(`Role: ${userDoc.role}`);
  console.log(`Password Hash: ${passwordHash.substring(0, 16)}... (bcrypt encrypted)`);
  console.log(`Temporary Password Flag (mustChangePassword): true`);
  console.log(`Storage: ${SQLITE_DB_PATH}`);
  console.log(`\nNOTE: The administrator will be forced to change this password on first login.`);
  console.log(`======================================================\n`);
} catch (err) {
  console.error('[Error] Password reset failed:', err.message);
  process.exit(1);
}
