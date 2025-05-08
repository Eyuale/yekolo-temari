// utils/mongoose.ts
import mongoose from 'mongoose';

// Check if MongoDB URI is defined
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Define MONGODB_URI in .env.local');

// Define the type for our cached connection
type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<typeof mongoose>;
};

// Define the global type with our mongoose cache
declare global {
  // Using var is intentional here for global variables in Node.js
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Use the global cache or create a new one
let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: mongoose.connect(uri)
  };
}

/**
 * Connect to MongoDB using a cached connection
 */
export default async function dbConnect(): Promise<mongoose.Connection> {
  // If we have a cached connection, return it
  if (cached?.conn) {
    return cached.conn;
  }

  // Wait for the connection to be established
  const mongoose = await cached!.promise;

  // Store the connection in the cache
  cached!.conn = mongoose.connection;

  // Return the connection
  return mongoose.connection;
}
