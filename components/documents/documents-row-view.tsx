// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Copy,
//   Download,
//   Edit,
//   Eye,
//   MoreHorizontal,
//   Trash2,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { copyToClipboard } from "@/lib/utils";
//
// export function DocumentsRowView({ documents }: { documents: IDocument[] }) {
//   return (
//     <div className="space-y-2">
//       {documents.map((doc) => (
//         <Card
//           key={doc._id}
//           className="hover:shadow-md transition-all duration-200"
//         >
//           <CardContent className="p-3">
//             <div className="flex items-center justify-between gap-4">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-3 mb-1">
//                   <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
//                     {(() => {
//                       const cleanId = doc._id
//                         .replace("ObjectId('", "")
//                         .replace("')", "");
//                       return `${cleanId.slice(0, 3)}...${cleanId.slice(-1)}`;
//                     })()}
//                   </code>
//                   <span>{doc.isActive ? "Active" : "Inactive"}</span>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => copyToClipboard(doc._id)}
//                     className="h-6 w-6 p-0 hover:bg-transparent hover:text-primary"
//                   >
//                     <Copy className="h-3 w-3" />
//                   </Button>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
//                   <div>
//                     {isLoading ? (
//                       <div className="space-y-1">
//                         <div className="h-4 w-24 bg-muted rounded animate-pulse" />
//                         <div className="h-3 w-32 bg-muted rounded animate-pulse" />
//                       </div>
//                     ) : (
//                       <>
//                         {/*<span className="font-medium">{doc.name}</span>*/}
//                         {/*<p className="text-muted-foreground text-xs">*/}
//                         {/*  {doc.email}*/}
//                         {/*</p>*/}
//                       </>
//                     )}
//                   </div>
//                   <div className="text-muted-foreground">
//                     {isLoading ? (
//                       <div className="space-y-1">
//                         <div className="h-3 w-16 bg-muted rounded animate-pulse" />
//                         <div className="h-3 w-20 bg-muted rounded animate-pulse" />
//                       </div>
//                     ) : (
//                       <>
//                         <p>
//                           Age: {/*{doc.age*/}
//                           {/*  .replace("NumberInt(", "")*/}
//                           {/*  .replace(")", "")}*/}
//                         </p>
//                         {/*<p>Size: {doc.size}</p>*/}
//                       </>
//                     )}
//                   </div>
//                   <div className="text-muted-foreground text-xs">
//                     {isLoading ? (
//                       <div className="space-y-1">
//                         <div className="h-3 w-24 bg-muted rounded animate-pulse" />
//                         <div className="h-3 w-28 bg-muted rounded animate-pulse" />
//                       </div>
//                     ) : (
//                       <>
//                         {/*<p>Created: {formatDate(doc.createdAt)}</p>*/}
//                         {/*<p>Modified: {formatDate(doc.lastModified)}</p>*/}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Dialog>
//                   <DialogTrigger asChild>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       // onClick={() => setSelectedDocument(doc)}
//                       className="hover:bg-transparent hover:text-primary cursor-pointer"
//                     >
//                       <Eye className="h-4 w-4 mr-2" />
//                       View
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
//                     <DialogHeader>
//                       <DialogTitle className="font-mono">
//                         Document Details
//                       </DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-4">
//                       <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
//                         {JSON.stringify(doc, null, 2)}
//                       </pre>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-8 w-8 p-0 hover:bg-transparent hover:text-primary cursor-pointer"
//                     >
//                       <MoreHorizontal className="h-4 w-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem className="cursor-pointer">
//                       <Edit className="h-4 w-4 mr-2" />
//                       Edit Document
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="cursor-pointer">
//                       <Copy className="h-4 w-4 mr-2" />
//                       Duplicate
//                     </DropdownMenuItem>
//                     <DropdownMenuItem className="cursor-pointer">
//                       <Download className="h-4 w-4 mr-2" />
//                       Export JSON
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem className="cursor-pointer text-destructive">
//                       <Trash2 className="h-4 w-4 mr-2" />
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
