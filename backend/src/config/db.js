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
  removeDocFromSQLite,
  exportSQLiteToJSON,
  TABLE_MAP,
} from './sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'parkease_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database state with high-speed memory cache and SQLite backing
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
      const collections = Object.keys(this.data);
      for (const coll of collections) {
        this.data[coll] = loadCollectionFromSQLite(coll);
      }
    } catch (err) {
      console.error('[ParkEase DB] Error loading collections from storage:', err.message);
    }
  }

  save() {
    try {
      for (const [coll, items] of Object.entries(this.data)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            saveDocToSQLite(coll, item);
          }
        }
      }
      exportSQLiteToJSON();
    } catch (err) {
      console.error('[ParkEase DB] Error saving to storage:', err.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = loadCollectionFromSQLite(name) || [];
    }
    return this.data[name];
  }
}

export const localDB = new DatabaseManager();
export let isUsingMongoDB = false;
export let isUsingSQLite = true;

/**
 * Seed or verify designated Admin account(s) on startup
 */
export const seedAdminAccounts = async () => {
  const adminEmailsEnv = process.env.ADMIN_EMAIL || 'asjeevaaslm@gmail.com,admin@parkease.com,asjeevaa@gmail.com';
  const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const defaultPassword = process.env.ADMIN_PASSWORD || '123456789';

  const users = localDB.getCollection('users');

  for (const email of adminEmails) {
    let existing = users.find(u => (u.email || '').toLowerCase().trim() === email);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    if (existing) {
      existing.role = 'admin';
      existing.passwordHash = passwordHash;
      existing.mustChangePassword = true; // Temporary password must be changed
      existing.updatedAt = new Date().toISOString();
      saveDocToSQLite('users', existing);
      console.log(`[ParkEase Auth] Designated ADMIN account verified & password reset to temporary: ${email}`);
    } else {
      // Create new Admin user
      const newAdmin = {
        _id: `usr_admin_${uuidv4().substring(0, 8)}`,
        name: email.includes('asjeeva') ? 'Jeevaa A S (Owner)' : 'ParkEase Administrator',
        email: email,
        passwordHash: passwordHash,
        phone: '+91 9876543210',
        role: 'admin',
        mustChangePassword: true,
        avatar: '',
        vehicles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.unshift(newAdmin);
      saveDocToSQLite('users', newAdmin);
      console.log(`[ParkEase Auth] Seeded designated ADMIN account with temporary password: ${email}`);
    }
  }
  exportSQLiteToJSON();
};

/**
 * Connect to database:
 * 1. Initializes SQLite persistent engine.
 * 2. Attempts MongoDB Atlas / local connection if MONGODB_URI is provided.
 * 3. Seeds Admin accounts.
 */
export const connectDB = async () => {
  try {
    // 1. Initialize SQLite
    initSQLite();
    localDB.load();
    console.log(`\n======================================================`);
    console.log(`[ParkEase DB] Primary Persistent SQLite Engine Active`);
    console.log(`[ParkEase DB] Path: ${SQLITE_DB_PATH}`);
    console.log(`[ParkEase DB] Collections: users, locations, slots, bookings, payments, entry_logs`);

    // 2. Attempt MongoDB connection if configured
    const mongoURI = process.env.MONGODB_URI;
    if (mongoURI) {
      try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2000 });
        isUsingMongoDB = true;
        console.log(`[ParkEase DB] Connected to MongoDB Atlas: ${mongoURI}`);
      } catch (mErr) {
        isUsingMongoDB = false;
        console.log(`[ParkEase DB] MongoDB not reachable (${mErr.message}). Seamlessly running on SQLite engine.`);
      }
    }

    // 3. Seed Admin accounts securely
    await seedAdminAccounts();

    console.log(`======================================================\n`);
  } catch (err) {
    console.error('[ParkEase DB] Initialization error:', err);
    throw err;
  }
};

export { getSQLiteDB, SQLITE_DB_PATH };
