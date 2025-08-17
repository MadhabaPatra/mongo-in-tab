import { generateId } from "@/lib/utils";

const STORAGE_KEYS = {
  CONNECTIONS: "mongo_in_tab_connections",
  // CACHED_DATA: "mongodb_explorer_cache",
  // USER_PREFERENCES: "mongodb_explorer_preferences",
  // LAST_SESSION: "mongodb_explorer_last_session",
};

export class StorageManager {
  static addConnection(url: string, name?: string): string {
    try {
      const connections = this.getConnections();
      const index = connections.findIndex((conn) => conn.url === url);

      const connection: IConnection = {
        id: generateId(),
        url: url,
        name: name || this.extractNameFromUrl(url),
        lastUsed: new Date(),
      };

      if (index >= 0) {
        connections[index] = connection;
      } else {
        connections.unshift(connection);
      }

      // Keep only last 10 connections
      const limitedConnections = connections.slice(0, 10);
      localStorage.setItem(
        STORAGE_KEYS.CONNECTIONS,
        JSON.stringify(limitedConnections),
      );

      return connection.id;
    } catch (error) {
      throw error;
    }
  }

  // Connections
  static getConnections(): IConnection[] {
    try {
      const connections = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      return connections ? JSON.parse(connections) : [];
    } catch {
      return [];
    }
  }

  static getConnectionDetails(connectionId: string): IConnection | undefined {
    try {
      const connections = this.getConnections();

      const connection = connections.find((each) => each.id === connectionId);

      return connection;
    } catch {
      return undefined;
    }
  }

  static removeConnection(connectionId: string): boolean {
    try {
      const connections = this.getConnections();

      const filtered = connections.filter((conn) => conn.id !== connectionId);
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      return false;
    }
  }

  static removeAllConnections(): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify([]));
      return true;
    } catch (error) {
      return false;
    }
  }

  private static extractNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || "MongoDB Connection";
    } catch {
      return "MongoDB Connection";
    }
  }
}
