interface IConnection {
  id: string;
  url: string;
  name?: string;
  lastUsed?: Date;
}

interface IDatabase {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
  totalCollections?: number;
  totalDocuments?: number;
}

interface ICollection {
  name: string;
  // documents: number;
  // avgDocumentSize: number;
  // indexes: number;
  // lastModified: string;
}

interface IDocument {
  _id: string;
  [key: string]: unknown;
}

interface IDocumentPagination {
  currentPage: number;
  totalPages: number;
  totalDocuments: number;
  start: number;
  end: number;
}

interface IConnectionState {
  url: string;
  isConnecting: boolean;
  error: string | null;
  isConnected: boolean;
  connectionStatus:
    | "disconnected"
    | "connecting"
    | "connected"
    | "error"
    | "timeout";
}
