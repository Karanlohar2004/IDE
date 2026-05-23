const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/IDE";
const ATLAS_URI = "mongodb+srv://IDE:ide123@cluster0.vjauinb.mongodb.net/IDE";
const JSON_DB_PATH = path.join(__dirname, 'session.json');

let isMongoConnected = false;

// Define schema for session state
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, default: 'default', unique: true },
  activeFile: { type: String, default: '' },
  openTabs: { type: [String], default: [] },
  previewPort: { type: Number, default: 5000 },
  updatedAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

async function connectDb() {
  // Try connecting to LOCAL MongoDB or ENV URI
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 1500 // Quick timeout to fallback fast
    });
    isMongoConnected = true;
    console.log('💚 Connected to local/custom MongoDB successfully.');
    return;
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection failed. Trying MongoDB Atlas fallback...');
  }

  // Fallback 1: Try connecting to ATLAS MongoDB
  try {
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('💚 Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection failed. Falling back to local JSON database. Error:', err.message || err);
    isMongoConnected = false;
  }
}

async function getSession() {
  if (isMongoConnected) {
    try {
      let session = await Session.findOne({ sessionId: 'default' });
      if (!session) {
        session = await Session.create({ sessionId: 'default' });
      }
      return session;
    } catch (err) {
      console.error('Error fetching session from Mongo:', err);
    }
  }

  // Fallback: Read JSON database
  try {
    const data = await fs.readFile(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return default structure
    const defaultSession = {
      activeFile: '',
      openTabs: [],
      previewPort: 5000
    };
    await fs.writeFile(JSON_DB_PATH, JSON.stringify(defaultSession, null, 2));
    return defaultSession;
  }
}

async function saveSession(data) {
  if (isMongoConnected) {
    try {
      return await Session.findOneAndUpdate(
        { sessionId: 'default' },
        {
          activeFile: data.activeFile,
          openTabs: data.openTabs,
          previewPort: data.previewPort,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
    } catch (err) {
      console.error('Error saving session to Mongo:', err);
    }
  }

  // Fallback: Write to JSON database
  try {
    const sessionData = {
      activeFile: data.activeFile || '',
      openTabs: data.openTabs || [],
      previewPort: data.previewPort || 5000
    };
    await fs.writeFile(JSON_DB_PATH, JSON.stringify(sessionData, null, 2));
    return sessionData;
  } catch (err) {
    console.error('Error saving session to JSON:', err);
  }
}

module.exports = {
  connectDb,
  getSession,
  saveSession
};
