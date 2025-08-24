"use server";

import { MongoClient, ObjectId } from "mongodb";

/**
 * Cached MongoDB client wrapper
 */
interface CachedClient {
  client: MongoClient;
  lastUsed: number; // timestamp in ms
}

const MAX_CLIENTS = 50; // max number of unique clients cached
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const globalForMongo = global as unknown as {
  mongoClients?: Map<string, CachedClient>;
};

if (!globalForMongo.mongoClients) {
  globalForMongo.mongoClients = new Map();
}

/**
 * Cleanup idle clients
 */
async function cleanupIdleClients() {
  const clients = globalForMongo.mongoClients!;
  const now = Date.now();

  for (const [url, cached] of Array.from(clients)) {
    if (now - cached.lastUsed > IDLE_TIMEOUT) {
      try {
        await cached.client.close();
        clients.delete(url);
        console.log(`♻️ Closed idle MongoDB client for ${url}`);
      } catch (err) {
        console.warn(`⚠️ Failed to close client for ${url}:`, err);
      }
    }
  }

  // Enforce LRU size limit
  if (clients.size > MAX_CLIENTS) {
    const sorted = Array.from(clients.entries()).sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed,
    );
    const excess = clients.size - MAX_CLIENTS;
    for (let i = 0; i < excess; i++) {
      const [url, cached] = sorted[i];
      try {
        await cached.client.close();
        clients.delete(url);
        console.log(`🗑️ LRU evicted MongoDB client for ${url}`);
      } catch (err) {
        console.warn(`⚠️ Failed to evict client for ${url}:`, err);
      }
    }
  }
}

/**
 * Get or create MongoDB client with LRU + idle cache
 */
async function getMongoClient(connectionUrl: string): Promise<MongoClient> {
  if (!connectionUrl) throw new Error("Connection URL is required");

  const clients = globalForMongo.mongoClients!;

  if (clients.has(connectionUrl)) {
    const cached = clients.get(connectionUrl)!;
    cached.lastUsed = Date.now();
    return cached.client;
  }

  const client = new MongoClient(connectionUrl, {
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();

  clients.set(connectionUrl, { client, lastUsed: Date.now() });
  console.log("✅ New MongoDB client created for", connectionUrl);

  // Run cleanup in background
  cleanupIdleClients().catch((err) => console.warn("Cleanup error:", err));

  return client;
}

/**
 * Test MongoDB connection
 */
export async function testMongoConnection(
  connectionUrl: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const client = await getMongoClient(connectionUrl);
    await client.db("admin").command({ ping: 1 });
    return { success: true, message: "Connection successful" };
  } catch (error: any) {
    return { success: false, message: "Connection failed: " + error.message };
  }
}

/**
 * Fetch all databases
 */
export async function fetchDatabases(connectionUrl: string): Promise<{
  success: boolean;
  data?: IDatabase[];
  message?: string;
}> {
  try {
    const client = await getMongoClient(connectionUrl);
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    return { success: true, data: databases };
  } catch (error: any) {
    return { success: false, message: error?.message };
  }
}

/**
 * Fetch collections of a database
 */
export async function fetchCollections(
  connectionUrl: string,
  databaseName: string,
): Promise<{ success: boolean; data?: ICollection[]; message?: string }> {
  try {
    if (!databaseName) throw new Error("Database name is required");

    const client = await getMongoClient(connectionUrl);
    const database = client.db(databaseName);
    const collections = await database.listCollections().toArray();

    return { success: true, data: collections };
  } catch (error: any) {
    return { success: false, message: error?.message };
  }
}

/**
 * Serialize BSON/Date to JSON-safe values
 */
function serializeDocument(doc: any) {
  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      if (value && value._bsontype) {
        switch (value._bsontype) {
          case "ObjectId":
          case "UUID":
          case "Decimal128":
            return value.toString();
          case "Binary":
            return value.buffer?.toString("base64");
          default:
            return value.toString();
        }
      }
      return value;
    }),
  );
}

/**
 * Fetch documents from a collection with pagination
 */
export async function fetchDocuments(
  connectionUrl: string,
  databaseName: string,
  collectionName: string,
  query_string: string = "",
  page: number = 1,
  limit: number = 20,
): Promise<{
  success: boolean;
  data?: {
    documents: IDocument[];
    fields: string[];
    pagination: IDocumentPagination;
  };
  message?: string;
}> {
  try {
    if (!databaseName || !collectionName) {
      throw new Error("Database name and collection name are required");
    }

    if (page < 1) page = 1;
    if (limit < 1) limit = 20;

    const client = await getMongoClient(connectionUrl);
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    let query: Record<string, any> =
      query_string && query_string !== "{}" ? JSON.parse(query_string) : {};

    let totalDocuments = 0;
    try {
      totalDocuments = await collection.countDocuments(query);
    } catch {
      totalDocuments = await collection.estimatedDocumentCount();
    }

    const totalPages =
      totalDocuments > 0 ? Math.ceil(totalDocuments / limit) : 1;
    if (page > totalPages) page = totalPages;

    const skip = (page - 1) * limit;
    const documents = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    let fields: string[] = [];
    try {
      const fieldAgg = await collection
        .aggregate([
          { $sample: { size: 500 } },
          { $project: { fields: { $objectToArray: "$$ROOT" } } },
          { $unwind: "$fields" },
          { $group: { _id: null, allKeys: { $addToSet: "$fields.k" } } },
        ])
        .toArray();
      fields = fieldAgg.length > 0 ? fieldAgg[0].allKeys : [];
    } catch (err) {
      console.warn("Could not extract fields:", err);
    }

    const serializedDocs = documents.map(serializeDocument);

    return {
      success: true,
      data: {
        documents: serializedDocs,
        fields,
        pagination: {
          currentPage: totalDocuments > 0 ? page : 0,
          totalPages: totalDocuments > 0 ? totalPages : 0,
          totalDocuments,
          start: totalDocuments > 0 ? skip + 1 : 0,
          end: totalDocuments > 0 ? skip + documents.length : 0,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to fetch documents",
    };
  }
}

/**
 * Save/update a document
 */
function serialize(doc: any) {
  return JSON.parse(
    JSON.stringify(doc, (key, value) =>
      value instanceof Date
        ? value.toISOString()
        : value && value._bsontype === "ObjectId"
          ? value.toString()
          : value,
    ),
  );
}

export async function saveADocument(
  connectionUrl?: string,
  databaseName?: string | null,
  collectionName?: string | null,
  id?: string | ObjectId,
  update?: Record<string, any>,
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    if (!connectionUrl || !databaseName || !collectionName || !id) {
      throw new Error(
        "connectionUrl, databaseName, collectionName, and id are required",
      );
    }

    const client = await getMongoClient(connectionUrl);
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: "after", upsert: false },
    );

    if (!result) throw new Error("Failed to save the document");

    return { success: true, data: serialize(result) };
  } catch (error: any) {
    return { success: false, message: error?.message };
  }
}
