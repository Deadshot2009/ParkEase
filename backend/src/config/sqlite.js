import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
export const SQLITE_DB_PATH = path.join(DATA_DIR, 'parkease.sqlite');
const JSON_BACKUP_PATH = path.join(DATA_DIR, 'parkease_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance = null;

export const getSQLiteDB = () => {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(SQLITE_DB_PATH);
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
};

// Map collection name to SQLite table
export const TABLE_MAP = {
  users: 'users',
  locations: 'locations',
  slots: 'slots',
  bookings: 'bookings',
  payments: 'payments',
  entryLogs: 'entry_logs',
  vehicles: 'vehicles',
  reviews: 'reviews',
};

/**
 * Initialize SQLite database, create tables & indexes,
 * and auto-migrate existing data from parkease_db.json if SQLite is empty.
 */
export const initSQLite = () => {
  const db = getSQLiteDB();

  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT,
      updatedAt TEXT,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `);

  // Create Locations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      totalSlots INTEGER DEFAULT 0,
      availableSlots INTEGER DEFAULT 0,
      hourlyRate REAL DEFAULT 0,
      rating REAL DEFAULT 5.0,
      createdAt TEXT,
      updatedAt TEXT,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
  `);

  // Create Slots Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS slots (
      _id TEXT PRIMARY KEY,
      locationId TEXT NOT NULL,
      slotNumber TEXT NOT NULL,
      floor TEXT,
      type TEXT,
      status TEXT DEFAULT 'AVAILABLE',
      hourlyRate REAL DEFAULT 0,
      updatedAt TEXT,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_slots_loc ON slots(locationId);
    CREATE INDEX IF NOT EXISTS idx_slots_status ON slots(status);
    CREATE INDEX IF NOT EXISTS idx_slots_loc_num ON slots(locationId, slotNumber);
  `);

  // Create Bookings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      _id TEXT PRIMARY KEY,
      bookingReference TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT,
      userEmail TEXT,
      locationId TEXT NOT NULL,
      locationName TEXT,
      slotId TEXT NOT NULL,
      slotNumber TEXT NOT NULL,
      vehicleNumber TEXT,
      startTime TEXT,
      endTime TEXT,
      totalAmount REAL DEFAULT 0,
      paymentStatus TEXT DEFAULT 'PAID',
      bookingStatus TEXT DEFAULT 'CONFIRMED',
      createdAt TEXT,
      updatedAt TEXT,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(bookingReference);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(userId);
    CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slotId);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(bookingStatus);
  `);

  // Create Payments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      _id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL,
      bookingReference TEXT,
      userId TEXT NOT NULL,
      amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'INR',
      method TEXT,
      transactionId TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'SUCCESS',
      createdAt TEXT,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payments_txn ON payments(transactionId);
    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(bookingId);
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(userId);
  `);

  // Create Entry Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS entry_logs (
      _id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL,
      slotId TEXT NOT NULL,
      locationId TEXT NOT NULL,
      bookingReference TEXT NOT NULL,
      vehicleNumber TEXT,
      entryTime TEXT,
      exitTime TEXT,
      status TEXT NOT NULL,
      gate TEXT,
      createdAt TEXT,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_entry_logs_ref ON entry_logs(bookingReference);
  `);

  // Create Vehicles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      _id TEXT PRIMARY KEY,
      userId TEXT,
      plateNumber TEXT,
      type TEXT,
      data TEXT NOT NULL
    );
  `);

  // Create Reviews Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      _id TEXT PRIMARY KEY,
      locationId TEXT,
      userId TEXT,
      rating REAL,
      comment TEXT,
      createdAt TEXT,
      data TEXT NOT NULL
    );
  `);

  // Check if initial migration from JSON is needed
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0 && fs.existsSync(JSON_BACKUP_PATH)) {
    try {
      const raw = fs.readFileSync(JSON_BACKUP_PATH, 'utf-8');
      const jsonData = JSON.parse(raw);
      console.log('[ParkEase SQLite] Empty database detected. Migrating existing JSON records to SQLite...');
      
      let totalMigrated = 0;
      for (const [collName, items] of Object.entries(jsonData)) {
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            saveDocToSQLite(collName, item);
            totalMigrated++;
          }
        }
      }
      console.log(`[ParkEase SQLite] Successfully migrated ${totalMigrated} records to SQLite database!`);
    } catch (migErr) {
      console.error('[ParkEase SQLite] Migration error:', migErr.message);
    }
  }

  console.log(`[ParkEase SQLite] Database initialized successfully at: ${SQLITE_DB_PATH}`);
};

/**
 * Insert or replace a document in SQLite with structured fields + JSON payload
 */
export const saveDocToSQLite = (collectionName, doc) => {
  const db = getSQLiteDB();
  const table = TABLE_MAP[collectionName] || collectionName;
  const dataJson = JSON.stringify(doc);

  if (collectionName === 'users') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (_id, name, email, passwordHash, phone, role, createdAt, updatedAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc._id,
      doc.name || 'User',
      (doc.email || '').toLowerCase().trim(),
      doc.passwordHash || '',
      doc.phone || '',
      doc.role || 'user',
      doc.createdAt || new Date().toISOString(),
      doc.updatedAt || new Date().toISOString(),
      dataJson
    );
  } else if (collectionName === 'locations') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO locations (_id, name, address, city, totalSlots, availableSlots, hourlyRate, rating, createdAt, updatedAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc._id,
      doc.name || '',
      doc.address || '',
      doc.city || '',
      doc.totalSlots || 0,
      doc.availableSlots || 0,
      doc.pricing?.baseHourly || doc.hourlyRate || 0,
      doc.rating || 5.0,
      doc.createdAt || new Date().toISOString(),
      doc.updatedAt || new Date().toISOString(),
      dataJson
    );
  } else if (collectionName === 'slots') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO slots (_id, locationId, slotNumber, floor, type, status, hourlyRate, updatedAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc._id,
      doc.locationId,
      doc.slotNumber || '',
      doc.floor || '',
      doc.type || 'FOUR_WHEELER',
      doc.status || 'AVAILABLE',
      doc.hourlyRate || 0,
      doc.updatedAt || new Date().toISOString(),
      dataJson
    );
  } else if (collectionName === 'bookings') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO bookings (_id, bookingReference, userId, userName, userEmail, locationId, locationName, slotId, slotNumber, vehicleNumber, startTime, endTime, totalAmount, paymentStatus, bookingStatus, createdAt, updatedAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc._id,
      doc.bookingReference,
      doc.userId || '',
      doc.userName || '',
      doc.userEmail || '',
      doc.locationId || '',
      doc.locationName || '',
      doc.slotId || '',
      doc.slotNumber || '',
      doc.vehicle?.number || doc.vehicleNumber || '',
      doc.startTime || '',
      doc.endTime || '',
      doc.totalAmount || 0,
      doc.paymentStatus || 'PAID',
      doc.bookingStatus || 'CONFIRMED',
      doc.createdAt || new Date().toISOString(),
      doc.updatedAt || new Date().toISOString(),
      dataJson
    );
  } else if (collectionName === 'payments') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO payments (_id, bookingId, bookingReference, userId, amount, currency, method, transactionId, status, createdAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc._id,
      doc.bookingId || '',
      doc.bookingReference || '',
      doc.userId || '',
      doc.amount || 0,
      doc.currency || 'INR',
      doc.method || 'UPI',
      doc.transactionId || doc._id,
      doc.status || 'SUCCESS',
      doc.createdAt || new Date().toISOString(),
      dataJson
    );
  } else if (collectionName === 'entryLogs') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO entry_logs (_id, bookingId, slotId, locationId, bookingReference, vehicleNumber, entryTime, exitTime, status, gate, createdAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      doc._id,
      doc.bookingId || '',
      doc.slotId || '',
      doc.locationId || '',
      doc.bookingReference || '',
      doc.vehicleNumber || '',
      doc.entryTime || '',
      doc.exitTime || '',
      doc.status || 'ACTIVE',
      doc.gate || 'NORTH_GATE_1',
      doc.createdAt || new Date().toISOString(),
      dataJson
    );
  } else if (collectionName === 'vehicles') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO vehicles (_id, userId, plateNumber, type, data)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(doc._id, doc.userId || '', doc.plateNumber || '', doc.type || '', dataJson);
  } else if (collectionName === 'reviews') {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO reviews (_id, locationId, userId, rating, comment, createdAt, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(doc._id, doc.locationId || '', doc.userId || '', doc.rating || 5, doc.comment || '', doc.createdAt || new Date().toISOString(), dataJson);
  } else {
    // Generic fallback table if needed
    db.exec(`CREATE TABLE IF NOT EXISTS ${table} (_id TEXT PRIMARY KEY, data TEXT NOT NULL);`);
    const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (_id, data) VALUES (?, ?)`);
    stmt.run(doc._id, dataJson);
  }
};

/**
 * Remove a document by ID from SQLite
 */
export const removeDocFromSQLite = (collectionName, id) => {
  const db = getSQLiteDB();
  const table = TABLE_MAP[collectionName] || collectionName;
  const stmt = db.prepare(`DELETE FROM ${table} WHERE _id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
};

/**
 * Load all documents for a collection from SQLite
 */
export const loadCollectionFromSQLite = (collectionName) => {
  const db = getSQLiteDB();
  const table = TABLE_MAP[collectionName] || collectionName;
  try {
    const rows = db.prepare(`SELECT data FROM ${table}`).all();
    return rows.map(r => JSON.parse(r.data));
  } catch (err) {
    return [];
  }
};

/**
 * Export all SQLite data to JSON file for backup / backwards compatibility
 */
export const exportSQLiteToJSON = () => {
  try {
    const collections = ['users', 'locations', 'slots', 'bookings', 'payments', 'vehicles', 'entryLogs', 'reviews'];
    const exported = {};
    for (const coll of collections) {
      exported[coll] = loadCollectionFromSQLite(coll);
    }
    fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(exported, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ParkEase SQLite] Failed to write JSON backup:', err.message);
  }
};
