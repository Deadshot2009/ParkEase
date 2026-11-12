import { localDB, isUsingMongoDB } from '../config/db.js';
import { getInitialData } from '../seed/seedData.js';

// Initialize data if empty
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
    console.log('[ParkEase DB] Initialized rich seed data with locations, slots, demo users, and bookings.');
  }
};

export const getCollection = (name) => {
  return localDB.getCollection(name);
};

export const saveDB = () => {
  localDB.save();
};

export const findOne = (collectionName, predicate) => {
  const coll = localDB.getCollection(collectionName);
  return coll.find(predicate) || null;
};

export const findMany = (collectionName, predicate) => {
  const coll = localDB.getCollection(collectionName);
  if (!predicate) return [...coll];
  return coll.filter(predicate);
};

export const insertOne = (collectionName, item) => {
  const coll = localDB.getCollection(collectionName);
  coll.unshift(item);
  localDB.save();
  return item;
};

export const updateOne = (collectionName, predicate, updates) => {
  const coll = localDB.getCollection(collectionName);
  const idx = coll.findIndex(predicate);
  if (idx !== -1) {
    coll[idx] = { ...coll[idx], ...updates, updatedAt: new Date().toISOString() };
    localDB.save();
    return coll[idx];
  }
  return null;
};

export const deleteOne = (collectionName, predicate) => {
  const coll = localDB.getCollection(collectionName);
  const idx = coll.findIndex(predicate);
  if (idx !== -1) {
    const removed = coll.splice(idx, 1)[0];
    localDB.save();
    return removed;
  }
  return null;
};
