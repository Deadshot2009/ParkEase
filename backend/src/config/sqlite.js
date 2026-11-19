
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// DATABASE PATH CONFIGURATION
// --------------------------------------------------

// Configure PARKEASE_DATA_DIR to a persistent disk mount
// when deploying on Render.
const DATA_DIR =
  process.env.PARKEASE_DATA_DIR ||
  process.env.DATA_DIR ||
  (process.env.VERCEL
    ? '/tmp'
    : path.join(__dirname, '../data'));

export const SQLITE_DB_PATH = path.join(
  DATA_DIR,
  'parkease.sqlite'
);

const JSON_BACKUP_PATH = path.join(
  DATA_DIR,
  'parkease_db.json'
);

const SEED_BACKUP_PATH = path.join(
  __dirname,
  '../data/parkease_db.json'
);

const COLLECTIONS = [
  'users',
  'locations',
  'slots',
  'bookings',
  'payments',
  'entryLogs',
  'vehicles',
  'reviews'
];

export const TABLE_MAP = {
  users: 'users',
  locations: 'locations',
  slots: 'slots',
  bookings: 'bookings',
  payments: 'payments',
  entryLogs: 'entry_logs',
  vehicles: 'vehicles',
  reviews: 'reviews'
};

let dbInstance = null;
let initialized = false;

// --------------------------------------------------
// DIRECTORY
// --------------------------------------------------

const ensureDataDirectory = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

export const getSQLiteDB = () => {
  ensureDataDirectory();

  if (!dbInstance) {
    dbInstance = new DatabaseSync(SQLITE_DB_PATH);

    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
  }

  return dbInstance;
};

// --------------------------------------------------
// TABLE VALIDATION
// --------------------------------------------------

const getTableName = (collectionName) => {
  const table = TABLE_MAP[collectionName];

  if (!table) {
    throw new Error(
      `Unknown database collection: ${collectionName}`
    );
  }

  return table;
};

// --------------------------------------------------
// INITIALIZE DATABASE TABLES
// --------------------------------------------------

const createTables = (db) => {
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

    CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

    CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

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

    CREATE INDEX IF NOT EXISTS idx_locations_name
    ON locations(name);

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

    CREATE INDEX IF NOT EXISTS idx_slots_loc
    ON slots(locationId);

    CREATE INDEX IF NOT EXISTS idx_slots_status
    ON slots(status);

    CREATE INDEX IF NOT EXISTS idx_slots_loc_num
    ON slots(locationId, slotNumber);

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

    CREATE INDEX IF NOT EXISTS idx_bookings_ref
    ON bookings(bookingReference);

    CREATE INDEX IF NOT EXISTS idx_bookings_user
    ON bookings(userId);

    CREATE INDEX IF NOT EXISTS idx_bookings_slot
    ON bookings(slotId);

    CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings(bookingStatus);

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

    CREATE INDEX IF NOT EXISTS idx_payments_txn
    ON payments(transactionId);

    CREATE INDEX IF NOT EXISTS idx_payments_booking
    ON payments(bookingId);

    CREATE INDEX IF NOT EXISTS idx_payments_user
    ON payments(userId);

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

    CREATE INDEX IF NOT EXISTS idx_entry_logs_ref
    ON entry_logs(bookingReference);

    CREATE TABLE IF NOT EXISTS vehicles (
      _id TEXT PRIMARY KEY,
      userId TEXT,
      plateNumber TEXT,
      type TEXT,
      data TEXT NOT NULL
    );

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
};

// --------------------------------------------------
// SAVE DOCUMENT
// --------------------------------------------------

export const saveDocToSQLite = (collectionName, doc) => {
  if (!doc || typeof doc !== 'object' || !doc._id) {
    throw new Error('A valid document with _id is required.');
  }

  const db = getSQLiteDB();
  const dataJson = JSON.stringify(doc);

  if (dataJson === undefined) {
    throw new Error('Document could not be serialized.');
  }

  const now = new Date().toISOString();

  const upsert = (table, columns, values) => {
    const placeholders = columns.map(() => '?').join(', ');

    const updates = columns
      .filter((column) => column !== '_id')
      .map((column) => `${column} = excluded.${column}`)
      .join(', ');

    const sql = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT(_id) DO UPDATE SET ${updates}
    `;

    db.prepare(sql).run(...values);
  };

  switch (collectionName) {
    case 'users': {
      if (!doc.email || !doc.email.trim()) {
        throw new Error('User email is required.');
      }

      upsert('users', [
        '_id',
        'name',
        'email',
        'passwordHash',
        'phone',
        'role',
        'createdAt',
        'updatedAt',
        'data'
      ], [
        doc._id,
        doc.name || 'User',
        doc.email.trim().toLowerCase(),
        doc.passwordHash || '',
        doc.phone || '',
        doc.role || 'user',
        doc.createdAt || now,
        doc.updatedAt || now,
        dataJson
      ]);

      break;
    }

    case 'locations': {
      upsert('locations', [
        '_id',
        'name',
        'address',
        'city',
        'totalSlots',
        'availableSlots',
        'hourlyRate',
        'rating',
        'createdAt',
        'updatedAt',
        'data'
      ], [
        doc._id,
        doc.name || 'Unnamed Location',
        doc.address || '',
        doc.city || '',
        doc.totalSlots ?? 0,
        doc.availableSlots ?? 0,
        doc.pricing?.hourlyRate ?? doc.hourlyRate ?? 0,
        doc.rating ?? 5,
        doc.createdAt || now,
        doc.updatedAt || now,
        dataJson
      ]);

      break;
    }

    case 'slots': {
      upsert('slots', [
        '_id',
        'locationId',
        'slotNumber',
        'floor',
        'type',
        'status',
        'hourlyRate',
        'updatedAt',
        'data'
      ], [
        doc._id,
        doc.locationId || '',
        doc.slotNumber || '',
        doc.floor || '',
        doc.type || 'Standard',
        doc.status || 'available',
        doc.hourlyRate ?? 0,
        doc.updatedAt || now,
        dataJson
      ]);

      break;
    }

    case 'bookings': {
      upsert('bookings', [
        '_id',
        'bookingReference',
        'userId',
        'userName',
        'userEmail',
        'locationId',
        'locationName',
        'slotId',
        'slotNumber',
        'vehicleNumber',
        'startTime',
        'endTime',
        'totalAmount',
        'paymentStatus',
        'bookingStatus',
        'createdAt',
        'updatedAt',
        'data'
      ], [
        doc._id,
        doc.bookingReference || doc._id,
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
        doc.totalAmount ?? 0,
        doc.paymentStatus || 'PAID',
        doc.bookingStatus || 'CONFIRMED',
        doc.createdAt || now,
        doc.updatedAt || now,
        dataJson
      ]);

      break;
    }

    case 'payments': {
      upsert('payments', [
        '_id',
        'bookingId',
        'bookingReference',
        'userId',
        'amount',
        'currency',
        'method',
        'transactionId',
        'status',
        'createdAt',
        'data'
      ], [
        doc._id,
        doc.bookingId || '',
        doc.bookingReference || '',
        doc.userId || '',
        doc.amount ?? 0,
        doc.currency || 'INR',
        doc.method || 'UPI',
        doc.transactionId || doc._id,
        doc.status || 'SUCCESS',
        doc.createdAt || now,
        dataJson
      ]);

      break;
    }

    case 'entryLogs': {
      upsert('entry_logs', [
        '_id',
        'bookingId',
        'slotId',
        'locationId',
        'bookingReference',
        'vehicleNumber',
        'entryTime',
        'exitTime',
        'status',
        'gate',
        'createdAt',
        'data'
      ], [
        doc._id,
        doc.bookingId || '',
        doc.slotId || '',
        doc.locationId || '',
        doc.bookingReference || '',
        doc.vehicleNumber || '',
        doc.entryTime || '',
        doc.exitTime || '',
        doc.status || 'ACTIVE',
        doc.gate || '',
        doc.createdAt || now,
        dataJson
      ]);

      break;
    }

    case 'vehicles': {
      upsert('vehicles', [
        '_id',
        'userId',
        'plateNumber',
        'type',
        'data'
      ], [
        doc._id,
        doc.userId || '',
        doc.plateNumber || '',
        doc.type || '',
        dataJson
      ]);

      break;
    }

    case 'reviews': {
      upsert('reviews', [
        '_id',
        'locationId',
        'userId',
        'rating',
        'comment',
        'createdAt',
        'data'
      ], [
        doc._id,
        doc.locationId || '',
        doc.userId || '',
        doc.rating ?? 5,
        doc.comment || '',
        doc.createdAt || now,
        dataJson
      ]);

      break;
    }

    default:
      throw new Error(
        `Unsupported collection: ${collectionName}`
      );
  }
};

// --------------------------------------------------
// DELETE DOCUMENT
// --------------------------------------------------

export const removeDocFromSQLite = (
  collectionName,
  id
) => {
  if (!id) {
    throw new Error('Document ID is required.');
  }

  const db = getSQLiteDB();
  const table = getTableName(collectionName);

  const result = db
    .prepare(`DELETE FROM ${table} WHERE _id = ?`)
    .run(id);

  return result.changes > 0;
};

// --------------------------------------------------
// LOAD COLLECTION
// --------------------------------------------------

export const loadCollectionFromSQLite = (
  collectionName
) => {
  const db = getSQLiteDB();
  const table = getTableName(collectionName);

  const rows = db
    .prepare(`SELECT data FROM ${table}`)
    .all();

  return rows.map((row) => JSON.parse(row.data));
};

// --------------------------------------------------
// EXPORT JSON BACKUP
// --------------------------------------------------

export const exportSQLiteToJSON = () => {
  ensureDataDirectory();

  const db = getSQLiteDB();

  const exported = {};

  for (const collection of COLLECTIONS) {
    exported[collection] =
      loadCollectionFromSQLite(collection);
  }

  const tempPath = `${JSON_BACKUP_PATH}.tmp`;

  try {
    fs.writeFileSync(
      tempPath,
      JSON.stringify(exported, null, 2),
      'utf-8'
    );

    fs.renameSync(tempPath, JSON_BACKUP_PATH);

    return true;
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    console.error(
      '[ParkEase SQLite] JSON backup failed:',
      error.message
    );

    throw error;
  }
};

// --------------------------------------------------
// MIGRATE JSON BACKUP
// --------------------------------------------------

const migrateJSONToSQLite = (db) => {
  let sourcePath = null;

  if (
    fs.existsSync(JSON_BACKUP_PATH) &&
    JSON_BACKUP_PATH !== SQLITE_DB_PATH
  ) {
    sourcePath = JSON_BACKUP_PATH;
  } else if (fs.existsSync(SEED_BACKUP_PATH)) {
    sourcePath = SEED_BACKUP_PATH;
  }

  if (!sourcePath) {
    console.log('[ParkEase SQLite] No JSON backup to migrate.');
    return;
  }

  const jsonData = JSON.parse(
    fs.readFileSync(sourcePath, 'utf-8')
  );

  let migrated = 0;

  db.exec('BEGIN IMMEDIATE');

  try {
    for (const collection of COLLECTIONS) {
      const items = jsonData[collection];

      if (!Array.isArray(items) || items.length === 0) {
        continue;
      }

      const table = getTableName(collection);

      const count = db
        .prepare(`SELECT COUNT(*) AS count FROM ${table}`)
        .get().count;

      // Migrate each collection independently.
      if (count > 0) {
        continue;
      }

      for (const item of items) {
        saveDocToSQLite(collection, item);
        migrated++;
      }
    }

    db.exec('COMMIT');

    console.log(
      `[ParkEase SQLite] Migration completed: ${migrated} records.`
    );
  } catch (error) {
    db.exec('ROLLBACK');

    console.error(
      '[ParkEase SQLite] Migration failed:',
      error.message
    );

    throw error;
  }
};

// --------------------------------------------------
// INITIALIZE SQLITE
// --------------------------------------------------

export const initSQLite = () => {
  if (initialized) {
    return getSQLiteDB();
  }

  const db = getSQLiteDB();

  try {
    createTables(db);

    migrateJSONToSQLite(db);

    initialized = true;

    console.log(
      `[ParkEase SQLite] Database initialized: ${SQLITE_DB_PATH}`
    );

    return db;
  } catch (error) {
    initialized = false;

    console.error(
      '[ParkEase SQLite] Initialization failed:',
      error.message
    );

    throw error;
  }
};
