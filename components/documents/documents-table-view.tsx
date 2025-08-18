import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard, getFieldType } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import EditDocument from "@/components/documents/edit-documents";

export function DocumentsTableView({
  fields,
  documents,
  handleSaveDocument,
}: {
  fields: string[];
  documents: IDocument[];
  handleSaveDocument: (updatedDocument: IDocument) => Promise<void>;
}) {
  const [sidebarDocument, setSidebarDocument] = useState<IDocument | null>(
    null,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDocumentOpen, setEditDocumentOpen] = useState(false);

  const handleOpenJsonSidebar = (doc: IDocument) => {
    setSidebarDocument(doc);
    setSidebarOpen(true);
  };

  const handleEditDocument = (doc: IDocument) => {
    setSidebarDocument(doc);
    setEditDocumentOpen(true);
  };

  const displayAllFieldsExceptID = fields.filter((field) => field !== "_id");

  const renderCellValue = (value: any) => {
    const fieldType = getFieldType(value);

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`font-medium ${value ? "text-green-600" : "text-red-600"}`}
        >
          {value.toString()}
        </span>
      );
    }

    if (typeof value === "string") {
      let displayValue = value;
      const colorClass = "text-muted-foreground";

      switch (fieldType) {
        case "objectid":
          displayValue = value.replace("ObjectId('", "").replace("')", "");
          break;
        case "int32":
          displayValue = value.replace("NumberInt(", "").replace(")", "");
          break;
        case "int64":
          displayValue = value.replace("NumberLong(", "").replace(")", "");
          break;
        case "double":
          displayValue = value.replace("NumberDouble(", "").replace(")", "");
          break;
        case "decimal128":
          displayValue = value.replace("NumberDecimal('", "").replace("')", "");
          break;
        case "date":
          displayValue = value.replace("ISODate('", "").replace("')", "");
          break;
        case "timestamp":
          displayValue = value.replace("Timestamp(", "").replace(")", "");
          break;
        case "bindata":
          displayValue = "Binary Data";
          break;
        case "code":
          displayValue = "JavaScript Code";
          break;
        default:
          if (value.length > 20) {
            displayValue = value.slice(0, 20) + "...";
          }
      }

      return (
        <span
          title={value}
          className={`font-mono text-sm ${colorClass} truncate block max-w-[150px]`}
        >
          {displayValue}
        </span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <code className="text-xs bg-muted px-1 py-0.5 rounded text-muted-foreground truncate block max-w-[150px]">
          [
          {value
            .slice(0, 2)
            .map((v) => (typeof v === "string" ? `"${v}"` : v))
            .join(", ")}
          {value.length > 2 ? "..." : ""}] ({value.length})
        </code>
      );
    }

    if (typeof value === "object") {
      return (
        <code className="text-xs bg-muted px-1 py-0.5 rounded text-muted-foreground truncate block max-w-[150px]">
          {JSON.stringify(value).slice(0, 30)}...
        </code>
      );
    }

    return <span className="truncate block max-w-[150px]">{value}</span>;
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background">
                Document ID
              </TableHead>
              {displayAllFieldsExceptID.map((field) => (
                <TableHead key={field} className="min-w-[120px]">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </TableHead>
              ))}
              <TableHead className="w-[100px] sticky right-0 bg-background">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, i) => (
              <TableRow key={i} className="hover:bg-muted/50">
                <TableCell className="sticky left-0 bg-background">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {(() => {
                        const cleanId = doc._id;
                        return `${cleanId.slice(0, 3)}...${cleanId.slice(-3)}`;
                      })()}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard(doc._id);
                        toast.success("Copied");
                      }}
                      className="h-7 w-7 p-0 hover:bg-transparent hover:text-primary"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                {displayAllFieldsExceptID.map((field) => (
                  <TableCell key={field} className="max-w-[150px] truncate">
                    {field === "lastModified" || field === "createdAt" ? (
                      <span className="text-muted-foreground text-sm truncate block">
                        {/*{doc[field] ?formatDate(doc[field]):"Invalid date"}*/}
                        {/*{doc[field]}*/}
                      </span>
                    ) : (
                      renderCellValue(doc[field])
                    )}
                  </TableCell>
                ))}
                <TableCell className="sticky right-0 bg-background z-30 pointer-events-auto">
                  <div className="flex items-center gap-1 relative z-40 pointer-events-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenJsonSidebar(doc)}
                      className="h-7 w-7 p-0 hover:bg-transparent hover:text-primary cursor-pointer relative z-50 pointer-events-auto"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-transparent hover:text-primary cursor-pointer relative z-50 pointer-events-auto"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleEditDocument(doc)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Document
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            copyToClipboard(JSON.stringify(doc));
                            toast.success("Copied");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        {/*<DropdownMenuItem className="cursor-pointer">*/}
                        {/*  <Download className="h-4 w-4 mr-2" />*/}
                        {/*  Export JSON*/}
                        {/*</DropdownMenuItem>*/}
                        {/*<DropdownMenuSeparator />*/}
                        {/*<DropdownMenuItem className="cursor-pointer text-destructive">*/}
                        {/*  <Trash2 className="h-4 w-4 mr-2" />*/}
                        {/*  Delete*/}
                        {/*</DropdownMenuItem>*/}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex bg-[rgb(15_23_42)]/80">
          <div className="flex-1 " onClick={() => setSidebarOpen(false)} />
          <div className="w-1/2 bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Document JSON
                  </h3>
                  <p className="text-sm text-gray-600 font-json">
                    {sidebarDocument?._id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className={"cursor-pointer"}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      copyToClipboard(JSON.stringify(sidebarDocument, null, 2));
                      toast("Copied to clipboard");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    className={"cursor-pointer"}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm font-json whitespace-pre-wrap">
                {JSON.stringify(sidebarDocument, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {editDocumentOpen ? "True" : "False"}

      {sidebarDocument && (
        <EditDocument
          document={sidebarDocument}
          isOpen={editDocumentOpen}
          onClose={() => setEditDocumentOpen(false)}
          onSave={handleSaveDocument}
        />
      )}
    </Card>
  );
}
