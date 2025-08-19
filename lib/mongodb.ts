"use server";

import { MongoClient, ObjectId } from "mongodb";

/**
 * Test MongoDB connection
 * @param {string} connectionUrl - MongoDB connection string
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function testMongoConnection(
  connectionUrl: string,
): Promise<{ success: boolean; message: string }> {
  let client;

  try {
    if (!connectionUrl) {
      throw new Error("Connection URL is required");
    }

    // Test the connection
    client = new MongoClient(connectionUrl, {
      serverSelectionTimeoutMS: 5000, // fail fast if server not reachable
    });

    // Attempt connection
    await client.connect();

    // Ping the server to ensure connectivity
    await client.db("admin").command({ ping: 1 });

    await client.close();

    return { success: true, message: "Connection successful" };
  } catch (error: any) {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {}
    }

    // Handle different failure scenarios
    if (error.name === "MongoServerSelectionError") {
      return {
        success: false,
        message: "Server not reachable: " + error.message,
      };
    }
    if (error.name === "MongoParseError") {
      return { success: false, message: "Invalid MongoDB URI format" };
    }
    if (error.name === "MongoNetworkError") {
      return { success: false, message: "Network error: " + error.message };
    }

    return { success: false, message: "Connection failed: " + error.message };
  }
}

/**
 * Fetch all databases from a MongoDB connection
 * @param {string} connectionUrl - MongoDB connection string
 * @returns {Promise<{ success: boolean, data?: IDatabase[], message: string }>}
 */
export async function fetchDatabases(connectionUrl: string): Promise<{
  success: boolean;
  data?: IDatabase[];
  message?: string;
}> {
  if (!connectionUrl) {
    throw new Error("Connection URL is required");
  }

  let client;
  try {
    client = new MongoClient(connectionUrl, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    // List all databases
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    try {
      await client.close();
    } catch (closeError) {}

    return {
      success: true,
      data: databases,
      message: "Databases fetched successfully",
    };
  } catch (error: any) {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {}
    }
    return {
      success: false,
      message: error?.message,
    };
  }
}

export async function fetchCollections(
  connectionUrl: string,
  databaseName: string,
): Promise<{
  success: boolean;
  data?: ICollection[];
  message?: string;
}> {
  let client;
  try {
    if (!connectionUrl || !databaseName) {
      throw new Error("Connection URL and database name are required");
    }

    client = new MongoClient(connectionUrl, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    const database = client.db(databaseName);
    const collections = await database.listCollections().toArray();

    // Get additional stats for each collection

    await client.close();

    return {
      success: true,
      data: collections,
    };
  } catch (error: any) {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {}
    }
    return {
      success: false,
      message: error?.message,
    };
  }
}

export async function fetchDocuments(
  connectionUrl: string,
  databaseName: string,
  collectionName: string,
  search: string = "",
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
  let client;
  try {
    if (!connectionUrl || !databaseName || !collectionName) {
      throw new Error(
        "Connection URL, database name, and collection name are required",
      );
    }

    client = new MongoClient(connectionUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    await client.connect();

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Build search query
    let query = {};

    // TODO
    if (search) {
      query = {};
    }

    // Get total count for pagination
    const totalDocuments = search
      ? await collection.countDocuments(query)
      : await collection.estimatedDocumentCount();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalDocuments / limit);

    // Fetch documents
    const documents = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    const fields = await collection
      .aggregate([
        { $sample: { size: 1000 } }, // randomly sample docs
        { $project: { fields: { $objectToArray: "$$ROOT" } } },
        { $unwind: "$fields" },
        { $group: { _id: null, allKeys: { $addToSet: "$fields.k" } } },
      ])
      .toArray();

    await client.close();

    return {
      success: true,
      data: {
        documents: JSON.parse(
          JSON.stringify(documents, (key, value) =>
            value instanceof Date
              ? value.toISOString()
              : value && value._bsontype === "ObjectId"
                ? value.toString()
                : value,
          ),
        ),
        fields: fields[0].allKeys,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          start: skip + 1,
          end: skip + documents.length,
        },
      },
    };
  } catch (error: any) {
    console.error("MongoDB connection error:", error);

    let errorMessage = "Failed to connect to MongoDB";

    // Return error instead of throwing to handle in component
    return {
      success: false,
      message: errorMessage,
    };
  }
}

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
  connectionUrl?: string | undefined,
  databaseName?: string | null,
  collectionName?: string | null,
  id?: string | ObjectId,
  update?: Record<string, any>,
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  let client: MongoClient | undefined;

  try {
    if (!connectionUrl || !databaseName || !collectionName || !id) {
      throw new Error(
        "connectionUrl, databaseName, collectionName, and id are required",
      );
    }

    client = new MongoClient(connectionUrl, { serverSelectionTimeoutMS: 5000 });
    await client.connect();

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: "after", upsert: false },
    );

    await client.close();

    if (!result) {
      throw new Error("Failed to save the document");
    }

    return {
      success: true,
      data: serialize(result),
    };
  } catch (error: any) {
    if (client) {
      try {
        await client.close();
      } catch (_) {}
    }
    return {
      success: false,
      message: error?.message,
    };
  }
}

// export async function fetchDatabasesByConnectionURL(connectionUrl: string) {
//   try {
//     if (!connectionUrl) {
//       throw new Error("Connection URL is required");
//     }
//
//     // Test the connection
//     const client = new MongoClient(connectionUrl, {
//       serverSelectionTimeoutMS: 5000, // 5 second timeout
//       connectTimeoutMS: 5000,
//       maxPoolSize: 10,
//       minPoolSize: 1,
//     });
//
//     await client.connect();
//
//     const admin = client.db().admin();
//     const result = await admin.listDatabases();
//
//     // Get additional stats for each database
//     const databases = await Promise.all(
//       result.databases.map(async (db: any) => {
//         try {
//           const database = client.db(db.name);
//           const collections = await database.listCollections().toArray();
//
//           // Calculate total documents across all collections
//           let totalDocuments = 0;
//           for (const collection of collections) {
//             try {
//               const count = await database
//                 .collection(collection.name)
//                 .estimatedDocumentCount();
//               totalDocuments += count;
//             } catch (e) {
//               // Skip if we can't count documents in this collection
//             }
//           }
//
//           return {
//             name: db.name,
//             sizeOnDisk: db.sizeOnDisk || 0,
//             collections: collections.length,
//             documents: totalDocuments,
//           };
//         } catch (e) {
//           return {
//             name: db.name,
//             sizeOnDisk: db.sizeOnDisk || 0,
//             collections: 0,
//             documents: 0,
//           };
//         }
//       }),
//     );
//
//     await client.close();
//
//     if (result.ok) {
//       return {
//         success: true,
//         data: databases,
//       };
//     } else {
//       // Return
//       throw new Error("Something went wrong while connecting to MongoDB.");
//     }
//   } catch (error: any) {
//     console.error("MongoDB connection error:", error);
//
//     let errorMessage = "Failed to connect to MongoDB";
//
//     if (error.message.includes("authentication failed")) {
//       errorMessage = "Authentication failed. Check your username and password.";
//     } else if (error.message.includes("connection refused")) {
//       errorMessage =
//         "Connection refused. Check if MongoDB is running and accessible.";
//     } else if (error.message.includes("timeout")) {
//       errorMessage =
//         "Connection timeout. Check your network and MongoDB server.";
//     } else if (error.message.includes("DNS")) {
//       errorMessage = "DNS resolution failed. Check your connection URL.";
//     } else {
//       errorMessage = error.message;
//     }
//
//     // Return error instead of throwing to handle in component
//     return {
//       success: false,
//       error: errorMessage,
//     };
//   }
// }

// export async function fetchCollectionsByConnectionURLAndDatabaseName(
//   connectionUrl: string,
//   databaseName: string,
// ) {
//   try {
//     if (!connectionUrl || !databaseName) {
//       throw new Error("Connection URL and database name are required");
//     }
//
//     const client = new MongoClient(connectionUrl, {
//       serverSelectionTimeoutMS: 10000,
//       connectTimeoutMS: 10000,
//     });
//
//     await client.connect();
//
//     const database = client.db(databaseName);
//     const collections = await database.listCollections().toArray();
//
//     // Get additional stats for each collection
//     const collectionsWithStats = await Promise.all(
//       collections.map(async (collection: any) => {
//         try {
//           const coll = database.collection(collection.name);
//           const documentCount = await coll.estimatedDocumentCount();
//
//           // Get collection stats
//           let avgDocSize = 0;
//           let indexCount = 0;
//
//           try {
//             const stats = await database.command({
//               collStats: collection.name,
//             });
//             avgDocSize = stats.avgObjSize || 0;
//             indexCount = stats.nindexes || 0;
//           } catch (e) {
//             // Stats might not be available for all collections
//           }
//
//           // Get indexes
//           try {
//             const indexes = await coll.indexes();
//             indexCount = indexes.length;
//           } catch (e) {
//             // Fallback if indexes() fails
//           }
//
//           return {
//             name: collection.name,
//             type: collection.type || "collection",
//             documents: documentCount,
//             avgDocumentSize: avgDocSize,
//             indexes: indexCount,
//             lastModified: new Date().toISOString(), // MongoDB doesn't track this by default
//           };
//         } catch (e) {
//           return {
//             name: collection.name,
//             type: collection.type || "collection",
//             documents: 0,
//             avgDocumentSize: 0,
//             indexes: 0,
//             lastModified: new Date().toISOString(),
//           };
//         }
//       }),
//     );
//
//     await client.close();
//
//     return {
//       success: true,
//       data: collectionsWithStats,
//     };
//   } catch (error: any) {
//     console.error("MongoDB connection error:", error);
//
//     let errorMessage = "Failed to connect to MongoDB";
//
//     if (error.message.includes("authentication failed")) {
//       errorMessage = "Authentication failed. Check your username and password.";
//     } else if (error.message.includes("connection refused")) {
//       errorMessage =
//         "Connection refused. Check if MongoDB is running and accessible.";
//     } else if (error.message.includes("timeout")) {
//       errorMessage =
//         "Connection timeout. Check your network and MongoDB server.";
//     } else if (error.message.includes("DNS")) {
//       errorMessage = "DNS resolution failed. Check your connection URL.";
//     } else {
//       errorMessage = error.message;
//     }
//
//     // Return error instead of throwing to handle in component
//     return {
//       success: false,
//       error: errorMessage,
//     };
//   }
// }
