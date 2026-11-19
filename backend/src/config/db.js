
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import {
  initSQLite,
  getSQLiteDB,
  SQLITE_DB_PATH,
  loadCollectionFromSQLite,
  saveDocToSQLite,
  exportSQLiteToJSON,
} from './sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// DATABASE CONFIGURATION
// --------------------------------------------------

const DATA_DIR = process.env.VERCEL
  ? '/tmp'
  : path.join(__dirname, '../data');

const DB_FILE = path.join(DATA_DIR, 'parkease_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --------------------------------------------------
// DATABASE MANAGER
// --------------------------------------------------

class DatabaseManager {
  constructor() {
    this.data = {
      users: [],
      locations: [],
      slots: [],
      bookings: [],
      payments: [],
      vehicles: [],
      entryLogs: [],
      reviews: [],
    };
  }

  load() {
    try {
      for (const collection of Object.keys(this.data)) {
        const records = loadCollectionFromSQLite(collection);

        this.data[collection] = Array.isArray(records)
          ? records
          : [];
      }

      console.log('[ParkEase DB] Collections loaded successfully.');
    } catch (error) {
      console.error(
        '[ParkEase DB] Load error:',
        error.message
      );

      throw error;
    }
  }

  save() {
    try {
      for (const [collection, items] of Object.entries(this.data)) {
        if (!Array.isArray(items)) {
          continue;
        }

        for (const item of items) {
          saveDocToSQLite(collection, item);
        }
      }

      exportSQLiteToJSON();

      return true;
    } catch (error) {
      console.error(
        '[ParkEase DB] Save error:',
        error.message
      );

      throw error;
    }
  }

  getCollection(name) {
    if (!Array.isArray(this.data[name])) {
      const records = loadCollectionFromSQLite(name);

      this.data[name] = Array.isArray(records)
        ? records
        : [];
    }

    return this.data[name];
  }
}

export const localDB = new DatabaseManager();

export let isUsingMongoDB = false;
export let isUsingSQLite = true;

// --------------------------------------------------
// ADMIN CONFIGURATION
// --------------------------------------------------

export const seedAdminAccounts = async () => {
  const adminEmailsEnv = process.env.ADMIN_EMAIL;

  if (!adminEmailsEnv) {
    console.warn(
      '[ParkEase Auth] ADMIN_EMAIL environment variable is not configured.'
    );
    return;
  }

  const adminEmails = [
    ...new Set(
      adminEmailsEnv
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const defaultPassword = process.env.ADMIN_PASSWORD;

  if (!defaultPassword || defaultPassword.length < 10) {
    throw new Error(
      'ADMIN_PASSWORD must be configured with at least 10 characters.'
    );
  }

  const users = localDB.getCollection('users');

  for (const email of adminEmails) {
    const existing = users.find(
      (user) =>
        (user.email || '').trim().toLowerCase() === email
    );

    if (existing) {
      // Preserve existing password.
      // Only ensure the configured account has admin role.
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        existing.updatedAt = new Date().toISOString();

        saveDocToSQLite('users', existing);

        console.log(
          `[ParkEase Auth] Admin role verified: ${email}`
        );
      }

      continue;
    }

    // Create a new admin only if account does not exist.
    const salt = await bcrypt.genSalt(12);

    const passwordHash = await bcrypt.hash(
      defaultPassword,
      salt
    );

    const newAdmin = {
      _id: `usr_admin_${uuidv4().substring(0, 8)}`,
      name: 'ParkEase Administrator',
      email,
      passwordHash,
      phone: '',
      role: 'admin',
      mustChangePassword: true,
      avatar: '',
      vehicles: [],
      favorites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.unshift(newAdmin);

    saveDocToSQLite('users', newAdmin);

    console.log(
      `[ParkEase Auth] New admin account created: ${email}`
    );
  }

  exportSQLiteToJSON();
};

// --------------------------------------------------
// CONNECT DATABASE
// --------------------------------------------------

let connectionPromise = null;

export const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      // 1. Initialize SQLite
      initSQLite();

      // 2. Load existing database records
      localDB.load();

      console.log('');
      console.log('============================================');
      console.log('[ParkEase DB] SQLite database initialized.');
      console.log(`[ParkEase DB] Database path: ${SQLITE_DB_PATH}`);

      // 3. SQLite is the active storage engine.
      // MongoDB is NOT enabled here because DatabaseManager
      // currently uses SQLite operations only.

      isUsingMongoDB = false;
      isUsingSQLite = true;

      console.log('[ParkEase DB] Active engine: SQLite');

      // 4. Seed or verify admin accounts
      await seedAdminAccounts();

      console.log('[ParkEase DB] Initialization completed.');
      console.log('============================================');
      console.log('');

      return true;
    } catch (error) {
      connectionPromise = null;

      console.error(
        '[ParkEase DB] Initialization failed:',
        error
      );

      throw error;
    }
  })();

  return connectionPromise;
};

// --------------------------------------------------
// DATABASE EXPORTS
// --------------------------------------------------

export {
  getSQLiteDB,
  SQLITE_DB_PATH,
};
