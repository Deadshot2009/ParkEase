import { localDB, isUsingMongoDB, getSQLiteDB } from '../config/db.js';
import { saveDocToSQLite, removeDocFromSQLite, exportSQLiteToJSON } from '../config/sqlite.js';
import { getInitialData } from '../seed/seedData.js';

// Global in-memory lock registry for concurrency & idempotency
const activeLocks = new Map();

export const acquireLock = (key, ttlMs = 15000) => {
  const now = Date.now();
  const existing = activeLocks.get(key);
  if (existing && existing > now) {
    return false; // Lock already held
  }
  activeLocks.set(key, now + ttlMs);
  return true;
};

export const releaseLock = (key) => {
  activeLocks.delete(key);
};

// Initialize data if empty & enforce unique integrity on load
export const initDataStore = () => {
  const users = localDB.getCollection('users');
  if (!users || users.length === 0) {
    const initial = getInitialData();
    localDB.data.users = initial.users;
    localDB.data.locations = initial.locations;
    localDB.data.slots = initial.slots;
    localDB.data.bookings = initial.bookings;
    localDB.data.payments = initial.payments;
    localDB.data.entryLogs = initial.entryLogs;
    localDB.save();
    console.log('[ParkEase SQLite] Initialized rich seed data with locations, slots, demo users, and bookings.');
  } else {
    // Run integrity cleanup
    cleanupDuplicates();
  }
};

/**
 * Deduplicate collections based on unique constraints:
 * - users: unique email and unique _id
 * - locations: unique _id and name
 * - slots: unique _id and (locationId + slotNumber)
 * - bookings: unique _id and bookingReference
 * - payments: unique _id and transactionId
 * - entryLogs: unique _id
 */
export const cleanupDuplicates = () => {
  let cleaned = 0;

  // 1. Users by email and _id
  const seenUserEmails = new Set();
  const seenUserIds = new Set();
  const uniqueUsers = [];
  for (const u of localDB.getCollection('users')) {
    const emailNorm = (u.email || '').toLowerCase().trim();
    if (!seenUserIds.has(u._id) && !seenUserEmails.has(emailNorm)) {
      seenUserIds.add(u._id);
      seenUserEmails.add(emailNorm);
      uniqueUsers.push(u);
    } else {
      cleaned++;
    }
  }
  localDB.data.users = uniqueUsers;

  // 2. Locations by _id
  const seenLocIds = new Set();
  const uniqueLocs = [];
  for (const loc of localDB.getCollection('locations')) {
    if (!seenLocIds.has(loc._id)) {
      seenLocIds.add(loc._id);
      uniqueLocs.push(loc);
    } else {
      cleaned++;
    }
  }
  localDB.data.locations = uniqueLocs;

  // 3. Slots by _id and (locationId + slotNumber)
  const seenSlotIds = new Set();
  const seenSlotKeys = new Set();
  const uniqueSlots = [];
  for (const s of localDB.getCollection('slots')) {
    const key = `${s.locationId}::${(s.slotNumber || '').toUpperCase()}`;
    if (!seenSlotIds.has(s._id) && !seenSlotKeys.has(key)) {
      seenSlotIds.add(s._id);
      seenSlotKeys.add(key);
      uniqueSlots.push(s);
    } else {
      cleaned++;
    }
  }
  localDB.data.slots = uniqueSlots;

  // 4. Bookings by _id and bookingReference
  const seenBookingIds = new Set();
  const seenBookingRefs = new Set();
  const uniqueBookings = [];
  for (const b of localDB.getCollection('bookings')) {
    const ref = b.bookingReference;
    if (!seenBookingIds.has(b._id) && (!ref || !seenBookingRefs.has(ref))) {
      seenBookingIds.add(b._id);
      if (ref) seenBookingRefs.add(ref);
      uniqueBookings.push(b);
    } else {
      cleaned++;
    }
  }
  localDB.data.bookings = uniqueBookings;

  // 5. Payments by _id and transactionId
  const seenPaymentIds = new Set();
  const seenTxnIds = new Set();
  const uniquePayments = [];
  for (const p of localDB.getCollection('payments')) {
    const txn = p.transactionId;
    if (!seenPaymentIds.has(p._id) && (!txn || !seenTxnIds.has(txn))) {
      seenPaymentIds.add(p._id);
      if (txn) seenTxnIds.add(txn);
      uniquePayments.push(p);
    } else {
      cleaned++;
    }
  }
  localDB.data.payments = uniquePayments;

  // 6. Entry logs by _id
  const seenLogIds = new Set();
  const uniqueLogs = [];
  for (const l of localDB.getCollection('entryLogs')) {
    if (!seenLogIds.has(l._id)) {
      seenLogIds.add(l._id);
      uniqueLogs.push(l);
    } else {
      cleaned++;
    }
  }
  localDB.data.entryLogs = uniqueLogs;

  if (cleaned > 0) {
    localDB.save();
    console.log(`[ParkEase SQLite] Purged ${cleaned} duplicate record(s) across database collections.`);
  }
};

export const getCollection = (name) => {
  return localDB.getCollection(name);
};

export const saveDB = () => {
  localDB.save();
};

export const findOne = (collectionName, predicate) => {
  localDB.load();
  const coll = localDB.getCollection(collectionName);
  return coll.find(predicate) || null;
};

export const findMany = (collectionName, predicate) => {
  localDB.load();
  const coll = localDB.getCollection(collectionName);
  if (!predicate) return [...coll];
  return coll.filter(predicate);
};

export const insertOne = (collectionName, item) => {
  const coll = localDB.getCollection(collectionName);
  
  // Guard against duplicate primary key _id
  if (item._id && coll.some(existing => existing._id === item._id)) {
    throw new Error(`Record with ID ${item._id} already exists in ${collectionName}`);
  }

  // Guard against duplicate user email
  if (collectionName === 'users' && item.email) {
    const emailNorm = item.email.toLowerCase().trim();
    if (coll.some(u => (u.email || '').toLowerCase().trim() === emailNorm)) {
      throw new Error(`User with email ${item.email} already exists`);
    }
  }

  // Guard against duplicate slot (locationId + slotNumber)
  if (collectionName === 'slots' && item.locationId && item.slotNumber) {
    const slotNumNorm = item.slotNumber.toUpperCase().trim();
    if (coll.some(s => s.locationId === item.locationId && (s.slotNumber || '').toUpperCase().trim() === slotNumNorm)) {
      throw new Error(`Slot ${item.slotNumber} already exists in location ${item.locationId}`);
    }
  }

  // Guard against duplicate booking reference
  if (collectionName === 'bookings' && item.bookingReference) {
    if (coll.some(b => b.bookingReference === item.bookingReference)) {
      throw new Error(`Booking with reference ${item.bookingReference} already exists`);
    }
  }

  // Guard against duplicate payment transaction ID
  if (collectionName === 'payments' && item.transactionId) {
    if (coll.some(p => p.transactionId === item.transactionId)) {
      throw new Error(`Payment with transactionId ${item.transactionId} already exists`);
    }
  }

  coll.unshift(item);
  saveDocToSQLite(collectionName, item);
  exportSQLiteToJSON();
  return item;
};

export const updateOne = (collectionName, predicate, updates) => {
  const coll = localDB.getCollection(collectionName);
  const idx = coll.findIndex(predicate);
  if (idx !== -1) {
    coll[idx] = { ...coll[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDocToSQLite(collectionName, coll[idx]);
    exportSQLiteToJSON();
    return coll[idx];
  }
  return null;
};

export const deleteOne = (collectionName, predicate) => {
  const coll = localDB.getCollection(collectionName);
  const idx = coll.findIndex(predicate);
  if (idx !== -1) {
    const removed = coll.splice(idx, 1)[0];
    removeDocFromSQLite(collectionName, removed._id);
    exportSQLiteToJSON();
    return removed;
  }
  return null;
};

/**
 * Direct SQL query execution against SQLite database
 */
export const querySQL = (sql, params = []) => {
  const db = getSQLiteDB();
  const stmt = db.prepare(sql);
  return stmt.all(...params);
};

export const executeSQL = (sql, params = []) => {
  const db = getSQLiteDB();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};
