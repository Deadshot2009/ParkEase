
import {
  localDB,
  isUsingMongoDB,
  getSQLiteDB
} from '../config/db.js';

import {
  saveDocToSQLite,
  removeDocFromSQLite,
  exportSQLiteToJSON
} from '../config/sqlite.js';

import { getInitialData } from '../seed/seedData.js';

// Global in-memory lock registry
const activeLocks = new Map();

// --------------------------------------------------
// LOCK MANAGEMENT
// --------------------------------------------------

export const acquireLock = (key, ttlMs = 15000) => {
  const now = Date.now();
  const existing = activeLocks.get(key);

  if (existing && existing > now) {
    return false;
  }

  activeLocks.set(key, now + ttlMs);
  return true;
};

export const releaseLock = (key) => {
  activeLocks.delete(key);
};

// --------------------------------------------------
// DATABASE HELPERS
// --------------------------------------------------

const getCollectionSafe = (name) => {
  const collection = localDB.getCollection(name);

  if (!Array.isArray(collection)) {
    localDB.data[name] = [];
    return localDB.data[name];
  }

  return collection;
};

const normalizeEmail = (email) =>
  (email || '').toLowerCase().trim();

const normalizeSlotNumber = (number) =>
  (number || '').toUpperCase().trim();

const persistCollection = (collectionName) => {
  localDB.save();
  exportSQLiteToJSON();
};

// --------------------------------------------------
// INITIALIZE DATABASE
// --------------------------------------------------

export const initDataStore = () => {
  const collections = [
    'users',
    'locations',
    'slots',
    'bookings',
    'payments',
    'entryLogs'
  ];

  collections.forEach((name) => {
    getCollectionSafe(name);
  });

  const users = getCollectionSafe('users');

  if (users.length === 0) {
    const initial = getInitialData();

    collections.forEach((name) => {
      localDB.data[name] = initial[name] || [];
    });

    localDB.save();

    console.log(
      '[ParkEase] Initial seed data created successfully.'
    );
  } else {
    cleanupDuplicates();
  }

  // Verify admin account without logging sensitive data
  const adminExists = getCollectionSafe('users').some(
    (user) =>
      normalizeEmail(user.email) === 'admin@parkease.com' &&
      user.role === 'admin'
  );

  if (!adminExists) {
    console.warn(
      '[ParkEase] Admin account is missing from the database.'
    );
  }
};

// --------------------------------------------------
// DUPLICATE CLEANUP
// --------------------------------------------------

export const cleanupDuplicates = () => {
  let cleaned = 0;

  // USERS
  const seenUserIds = new Set();
  const seenUserEmails = new Set();

  const uniqueUsers = [];

  for (const user of getCollectionSafe('users')) {
    const id = user._id;
    const email = normalizeEmail(user.email);

    if (
      (id && seenUserIds.has(id)) ||
      (email && seenUserEmails.has(email))
    ) {
      cleaned++;
      continue;
    }

    if (id) seenUserIds.add(id);
    if (email) seenUserEmails.add(email);

    uniqueUsers.push(user);
  }

  localDB.data.users = uniqueUsers;

  // LOCATIONS
  const seenLocationIds = new Set();
  const seenLocationNames = new Set();

  const uniqueLocations = [];

  for (const location of getCollectionSafe('locations')) {
    const id = location._id;
    const name = (location.name || '').toLowerCase().trim();

    if (
      (id && seenLocationIds.has(id)) ||
      (name && seenLocationNames.has(name))
    ) {
      cleaned++;
      continue;
    }

    if (id) seenLocationIds.add(id);
    if (name) seenLocationNames.add(name);

    uniqueLocations.push(location);
  }

  localDB.data.locations = uniqueLocations;

  // SLOTS
  const seenSlotIds = new Set();
  const seenSlotKeys = new Set();

  const uniqueSlots = [];

  for (const slot of getCollectionSafe('slots')) {
    const id = slot._id;
    const key = `${slot.locationId}::${normalizeSlotNumber(slot.slotNumber)}`;

    if (
      (id && seenSlotIds.has(id)) ||
      (slot.locationId && slot.slotNumber && seenSlotKeys.has(key))
    ) {
      cleaned++;
      continue;
    }

    if (id) seenSlotIds.add(id);

    if (slot.locationId && slot.slotNumber) {
      seenSlotKeys.add(key);
    }

    uniqueSlots.push(slot);
  }

  localDB.data.slots = uniqueSlots;

  // BOOKINGS
  const seenBookingIds = new Set();
  const seenBookingRefs = new Set();

  const uniqueBookings = [];

  for (const booking of getCollectionSafe('bookings')) {
    const id = booking._id;
    const ref = booking.bookingReference;

    if (
      (id && seenBookingIds.has(id)) ||
      (ref && seenBookingRefs.has(ref))
    ) {
      cleaned++;
      continue;
    }

    if (id) seenBookingIds.add(id);
    if (ref) seenBookingRefs.add(ref);

    uniqueBookings.push(booking);
  }

  localDB.data.bookings = uniqueBookings;

  // PAYMENTS
  const seenPaymentIds = new Set();
  const seenTransactionIds = new Set();

  const uniquePayments = [];

  for (const payment of getCollectionSafe('payments')) {
    const id = payment._id;
    const txn = payment.transactionId;

    if (
      (id && seenPaymentIds.has(id)) ||
      (txn && seenTransactionIds.has(txn))
    ) {
      cleaned++;
      continue;
    }

    if (id) seenPaymentIds.add(id);
    if (txn) seenTransactionIds.add(txn);

    uniquePayments.push(payment);
  }

  localDB.data.payments = uniquePayments;

  // ENTRY LOGS
  const seenLogIds = new Set();

  const uniqueLogs = [];

  for (const log of getCollectionSafe('entryLogs')) {
    if (log._id && seenLogIds.has(log._id)) {
      cleaned++;
      continue;
    }

    if (log._id) seenLogIds.add(log._id);

    uniqueLogs.push(log);
  }

  localDB.data.entryLogs = uniqueLogs;

  if (cleaned > 0) {
    persistCollection('users');

    console.log(
      `[ParkEase] Removed ${cleaned} duplicate records.`
    );
  }

  return cleaned;
};

// --------------------------------------------------
// COLLECTION ACCESS
// --------------------------------------------------

export const getCollection = (name) => {
  return getCollectionSafe(name);
};

export const saveDB = () => {
  localDB.save();
};

// --------------------------------------------------
// FIND ONE
// --------------------------------------------------

export const findOne = (collectionName, predicate) => {
  if (typeof predicate !== 'function') {
    throw new Error('findOne requires a predicate function.');
  }

  const collection = getCollectionSafe(collectionName);

  return collection.find(predicate) || null;
};

// --------------------------------------------------
// FIND MANY
// --------------------------------------------------

export const findMany = (collectionName, predicate) => {
  const collection = getCollectionSafe(collectionName);

  if (!predicate) {
    return [...collection];
  }

  return collection.filter(predicate);
};

// --------------------------------------------------
// INSERT ONE
// --------------------------------------------------

export const insertOne = (collectionName, item) => {
  if (!item || typeof item !== 'object') {
    throw new Error('Invalid document.');
  }

  const collection = getCollectionSafe(collectionName);

  // Primary key validation
  if (
    item._id &&
    collection.some((existing) => existing._id === item._id)
  ) {
    throw new Error(
      `Record with ID ${item._id} already exists in ${collectionName}`
    );
  }

  // User email validation
  if (collectionName === 'users' && item.email) {
    const email = normalizeEmail(item.email);

    if (
      collection.some(
        (user) => normalizeEmail(user.email) === email
      )
    ) {
      throw new Error(
        `User with email ${item.email} already exists`
      );
    }
  }

  // Slot validation
  if (
    collectionName === 'slots' &&
    item.locationId &&
    item.slotNumber
  ) {
    const slotNumber = normalizeSlotNumber(item.slotNumber);

    const exists = collection.some(
      (slot) =>
        slot.locationId === item.locationId &&
        normalizeSlotNumber(slot.slotNumber) === slotNumber
    );

    if (exists) {
      throw new Error(
        `Slot ${item.slotNumber} already exists in this location`
      );
    }
  }

  // Booking reference validation
  if (collectionName === 'bookings' && item.bookingReference) {
    if (
      collection.some(
        (booking) =>
          booking.bookingReference === item.bookingReference
      )
    ) {
      throw new Error('Booking reference already exists.');
    }
  }

  // Payment transaction validation
  if (collectionName === 'payments' && item.transactionId) {
    if (
      collection.some(
        (payment) =>
          payment.transactionId === item.transactionId
      )
    ) {
      throw new Error('Payment transaction ID already exists.');
    }
  }

  collection.unshift(item);

  try {
    saveDocToSQLite(collectionName, item);
    exportSQLiteToJSON();
    return item;
  } catch (error) {
    collection.shift();
    throw error;
  }
};

// --------------------------------------------------
// UPDATE ONE
// --------------------------------------------------

export const updateOne = (
  collectionName,
  predicate,
  updates
) => {
  if (typeof predicate !== 'function') {
    throw new Error('updateOne requires a predicate function.');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Invalid update data.');
  }

  const collection = getCollectionSafe(collectionName);

  const index = collection.findIndex(predicate);

  if (index === -1) {
    return null;
  }

  const previous = collection[index];

  const updated = {
    ...previous,
    ...updates,
    _id: previous._id,
    updatedAt: new Date().toISOString()
  };

  // Prevent duplicate user emails on update
  if (collectionName === 'users' && updated.email) {
    const email = normalizeEmail(updated.email);

    const duplicate = collection.some(
      (user, i) =>
        i !== index &&
        normalizeEmail(user.email) === email
    );

    if (duplicate) {
      throw new Error('Email already exists.');
    }
  }

  collection[index] = updated;

  try {
    saveDocToSQLite(collectionName, updated);
    exportSQLiteToJSON();
    return updated;
  } catch (error) {
    collection[index] = previous;
    throw error;
  }
};

// --------------------------------------------------
// DELETE ONE
// --------------------------------------------------

export const deleteOne = (collectionName, predicate) => {
  if (typeof predicate !== 'function') {
    throw new Error('deleteOne requires a predicate function.');
  }

  const collection = getCollectionSafe(collectionName);

  const index = collection.findIndex(predicate);

  if (index === -1) {
    return null;
  }

  const removed = collection[index];

  collection.splice(index, 1);

  try {
    removeDocFromSQLite(collectionName, removed._id);
    exportSQLiteToJSON();
    return removed;
  } catch (error) {
    collection.splice(index, 0, removed);
    throw error;
  }
};

// --------------------------------------------------
// DIRECT SQLITE QUERIES
// --------------------------------------------------

export const querySQL = (sql, params = []) => {
  if (isUsingMongoDB) {
    throw new Error('Direct SQLite queries are unavailable in MongoDB mode.');
  }

  const db = getSQLiteDB();
  const statement = db.prepare(sql);

  return statement.all(...params);
};

export const executeSQL = (sql, params = []) => {
  if (isUsingMongoDB) {
    throw new Error('Direct SQLite queries are unavailable in MongoDB mode.');
  }

  const db = getSQLiteDB();
  const statement = db.prepare(sql);

  return statement.run(...params);
};
