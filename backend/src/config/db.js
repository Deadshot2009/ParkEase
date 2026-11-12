import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'parkease_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory/File DB state
class LocalDocumentDB {
  constructor() {
    this.data = {
      users: [],
      locations: [],
      slots: [],
      bookings: [],
      payments: [],
      vehicles: [],
      entryLogs: [],
      reviews: []
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading local db file, initializing fresh:', e.message);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving local db file:', e.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }
}

export const localDB = new LocalDocumentDB();
export let isUsingMongoDB = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parkease';
  
  try {
    mongoose.set('strictQuery', false);
    // Attempt fast connection with 2 second timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isUsingMongoDB = true;
    console.log(`[ParkEase DB] Connected successfully to MongoDB: ${mongoURI}`);
  } catch (err) {
    isUsingMongoDB = false;
    console.log(`[ParkEase DB] Local/Remote MongoDB not running (${err.message}).`);
    console.log(`[ParkEase DB] Running seamlessly on persistent local document database at: ${DB_FILE}`);
  }
};
