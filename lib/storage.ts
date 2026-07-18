import { generateId } from "@/lib/utils";

const STORAGE_KEYS = {
  CONNECTIONS: "mongo_in_tab_connections",
  // CACHED_DATA: "mongodb_explorer_cache",
  // USER_PREFERENCES: "mongodb_explorer_preferences",
  // LAST_SESSION: "mongodb_explorer_last_session",
};

export class StorageManager {
  static addConnection(
    url: string,
    name?: string,
    color?: string,
    isFavorite?: boolean,
  ): string {
    try {
      const connections = this.getConnections();
      const index = connections.findIndex((conn) => conn.url === url);

      const connection: IConnection = {
        id: generateId(),
        url: url,
        name: name || this.extractNameFromUrl(url),
        lastUsed: new Date(),
        color,
        isFavorite,
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
    } catch {
      throw new Error("Failed to add connection");
    }
  }

  static loadSampleConnection(): string {
    try {
      const connections = this.getConnections();

      const url = process.env.NEXT_PUBLIC_SAMPLE_MONGODB_URI;

      if (!url) {
        throw new Error(`Failed to load sample database`);
      }

      const index = connections.findIndex((conn) => conn.url === url);

      const connection: IConnection = {
        id: "sample",
        url: url,
        name: "Sample Connection",
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
    } catch {
      throw new Error("Failed to load sample connection");
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
    } catch {
      return false;
    }
  }

  static removeAllConnections(): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify([]));
      return true;
    } catch {
      return false;
    }
  }

  static updateConnectionName(connectionId: string, name: string): boolean {
    try {
      const connections = this.getConnections();
      const index = connections.findIndex((conn) => conn.id === connectionId);
      if (index === -1) return false;
      connections[index] = { ...connections[index], name };
      localStorage.setItem(
        STORAGE_KEYS.CONNECTIONS,
        JSON.stringify(connections),
      );
      return true;
    } catch {
      return false;
    }
  }

  static updateConnectionColor(connectionId: string, color: string): boolean {
    try {
      const connections = this.getConnections();
      const index = connections.findIndex((conn) => conn.id === connectionId);
      if (index === -1) return false;
      connections[index] = { ...connections[index], color };
      localStorage.setItem(
        STORAGE_KEYS.CONNECTIONS,
        JSON.stringify(connections),
      );
      return true;
    } catch {
      return false;
    }
  }

  static updateConnectionFavorite(
    connectionId: string,
    isFavorite: boolean,
  ): boolean {
    try {
      const connections = this.getConnections();
      const index = connections.findIndex((conn) => conn.id === connectionId);
      if (index === -1) return false;
      connections[index] = { ...connections[index], isFavorite };
      localStorage.setItem(
        STORAGE_KEYS.CONNECTIONS,
        JSON.stringify(connections),
      );
      return true;
    } catch {
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
