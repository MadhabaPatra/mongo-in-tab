"use server";

import { MongoClient, ObjectId } from "mongodb";
import { EJSON } from "bson";
import { parseAndSanitizeQuery } from "@/lib/query-sanitizer";

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
 * Fetch stats for a single collection
 */
export async function fetchCollectionStats(
  connectionUrl: string,
  databaseName: string,
  collectionName: string,
): Promise<{
  success: boolean;
  data?: {
    documents: number;
    avgDocumentSize: number;
    indexes: number;
    totalSize: number;
    storageSize: number;
    lastModified?: string;
  };
  message?: string;
}> {
  try {
    if (!databaseName || !collectionName) {
      throw new Error("Database name and collection name are required");
    }

    const client = await getMongoClient(connectionUrl);
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    const result = await collection
      .aggregate([{ $collStats: { storageStats: {} } }])
      .toArray();
    const stats = result[0]?.storageStats ?? {};

    return {
      success: true,
      data: {
        documents: stats.count ?? 0,
        avgDocumentSize: stats.avgObjSize ?? 0,
        indexes: stats.nindexes ?? 0,
        totalSize: stats.size ?? 0,
        storageSize: stats.storageSize ?? 0,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to fetch collection stats",
    };
  }
}

/**
 * Serialize BSON to MongoDB Extended JSON (EJSON) preserving type info.
 */
function serializeDocument(doc: any) {
  return EJSON.serialize(doc);
}

/**
 * Fetch documents from a collection with pagination and options
 */
export async function fetchDocuments(
  connectionUrl: string,
  databaseName: string,
  collectionName: string,
  query_string: string = "",
  page: number = 1,
  limit: number = 20,
  options?: DocumentQueryOptions,
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

    // Sanitize numeric params to prevent NaN / invalid values
    const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 20;

    const client = await getMongoClient(connectionUrl);
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    let query: Record<string, any> = {};
    if (query_string && query_string.trim() && query_string.trim() !== "{}") {
      query = parseAndSanitizeQuery(query_string);
    }

    // Build find options
    const findOptions: Record<string, any> = {};
    if (options?.project && options.project.trim() && options.project !== "{}") {
      findOptions.projection = parseAndSanitizeQuery(options.project);
    }
    if (options?.sort && options.sort.trim() && options.sort !== "{}") {
      findOptions.sort = parseAndSanitizeQuery(options.sort);
    }
    if (options?.maxTimeMS && Number.isFinite(options.maxTimeMS) && options.maxTimeMS > 0) {
      findOptions.maxTimeMS = Math.floor(options.maxTimeMS);
    }

    let totalDocuments = 0;
    try {
      totalDocuments = await collection.countDocuments(query);
    } catch {
      totalDocuments = await collection.estimatedDocumentCount();
    }

    const rawSkip = options?.skip;
    const optionSkip =
      rawSkip !== undefined && rawSkip !== null && Number.isFinite(rawSkip) && rawSkip >= 0
        ? Math.floor(rawSkip)
        : 0;

    const rawQueryLimit = options?.limit;
    const queryLimit =
      rawQueryLimit !== undefined && rawQueryLimit !== null && Number.isFinite(rawQueryLimit) && rawQueryLimit >= 1
        ? Math.floor(rawQueryLimit)
        : undefined;

    // effectiveTotal = documents remaining after the initial skip, capped by query-level limit
    let effectiveTotal = Math.max(0, totalDocuments - optionSkip);
    if (queryLimit !== undefined) {
      effectiveTotal = Math.min(effectiveTotal, queryLimit);
    }

    const totalPages =
      effectiveTotal > 0 ? Math.ceil(effectiveTotal / safeLimit) : 1;
    const safePageNum = safePage > totalPages ? totalPages : safePage;

    const pageSkip = (safePageNum - 1) * safeLimit;
    const totalSkip = pageSkip + optionSkip;

    // Cap the page fetch by the remaining query-level limit
    const alreadyTaken = (safePageNum - 1) * safeLimit;
    const remainingQueryLimit =
      queryLimit !== undefined
        ? Math.max(0, queryLimit - alreadyTaken)
        : undefined;
    const pageLimit =
      remainingQueryLimit !== undefined
        ? Math.min(safeLimit, remainingQueryLimit)
        : safeLimit;

    let cursor = collection.find(query, findOptions);
    cursor = cursor.skip(totalSkip).limit(pageLimit);
    const documents = await cursor.toArray();

    // Extract fields only from the current page's documents
    const fieldSet = new Set<string>();
    for (const doc of documents) {
      for (const key of Object.keys(doc)) {
        fieldSet.add(key);
      }
    }
    const fields = Array.from(fieldSet).sort((a, b) => {
      if (a === "_id") return -1;
      if (b === "_id") return 1;
      return a.localeCompare(b);
    });

    const serializedDocs = documents.map(serializeDocument) as IDocument[];

    // Pagination numbers are relative to the skipped subset so page 1 always starts at 1
    return {
      success: true,
      data: {
        documents: serializedDocs,
        fields,
        pagination: {
          currentPage: effectiveTotal > 0 ? safePageNum : 0,
          totalPages: effectiveTotal > 0 ? totalPages : 0,
          totalDocuments: effectiveTotal,
          start: effectiveTotal > 0 ? pageSkip + 1 : 0,
          end: effectiveTotal > 0 ? pageSkip + documents.length : 0,
        },
      },
    };
  } catch (error: any) {
    console.error("[fetchDocuments error]", error);
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
