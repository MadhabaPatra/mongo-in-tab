interface IConnection {
  id: string;
  url: string;
  name?: string;
  lastUsed?: Date;
  color?: string;
  isFavorite?: boolean;
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

interface DocumentQueryOptions {
  project?: string;
  sort?: string;
  skip?: number;
  maxTimeMS?: number;
}

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  isFavorite?: boolean;
}
