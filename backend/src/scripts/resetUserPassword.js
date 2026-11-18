import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getSQLiteDB, initSQLite, SQLITE_DB_PATH, saveDocToSQLite } from '../config/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const targetEmail = (process.argv[2] || 'user@parkease.com').toLowerCase().trim();
const newPassword = process.argv[3] || '123456789';

console.log(`\n======================================================`);
console.log(`🔐 ParkEase User Password Reset Script`);
console.log(`Target User: ${targetEmail}`);
console.log(`======================================================\n`);

try {
  initSQLite();
  const db = getSQLiteDB();

  // Find existing user
  const row = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(targetEmail);

  if (!row) {
    console.error(`[Error] User with email "${targetEmail}" was not found.`);
    const existingUsers = db.prepare('SELECT email, role FROM users').all();
    console.log('Existing Users in database:');
    existingUsers.forEach(u => console.log(` - ${u.email} (${u.role})`));
    process.exit(1);
  }

  const userDoc = JSON.parse(row.data);

  // Hash new temporary password
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  // Update existing user account
  userDoc.passwordHash = passwordHash;
  userDoc.mustChangePassword = true; // Temporary password flag
  userDoc.updatedAt = new Date().toISOString();

  // Update in SQLite
  saveDocToSQLite('users', userDoc);

  console.log(`[SUCCESS] Password for user "${userDoc.name}" (${userDoc.email}) has been reset!`);
  console.log(`Database ID: ${userDoc._id}`);
  console.log(`Role: ${userDoc.role}`);
  console.log(`Password Hash: ${passwordHash.substring(0, 16)}... (bcrypt encrypted)`);
  console.log(`Temporary Password Flag (mustChangePassword): true`);
  console.log(`Storage: ${SQLITE_DB_PATH}`);
  console.log(`\nNOTE: The user will be forced to change this temporary password (123456789) on first login.`);
  console.log(`======================================================\n`);
} catch (err) {
  console.error('[Error] User password reset failed:', err.message);
  process.exit(1);
}
