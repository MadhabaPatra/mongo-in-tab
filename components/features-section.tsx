import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  Download,
  Edit,
  Plug,
  Search,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Plug,
    title: "Instant Connect",
    description:
      "Paste your MongoDB URL and start exploring—no client installation required.",
  },
  {
    icon: Database,
    title: "Database Browsing",
    description:
      "View and navigate all your databases, collections, and documents in one place.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find data effortlessly with powerful filters, queries, and pagination.",
  },
  {
    icon: Edit,
    title: "Easy Editing",
    description:
      "Edit, update, or delete documents from a simple interface designed for everyone.",
  },
  {
    icon: ShieldCheck,
    title: "100% Private",
    description:
      "Your data never leaves your browser. Everything stays local and secure.",
  },
  {
    icon: Download,
    title: "Export & Download",
    description:
      "Easily export data or download documents for backups and sharing.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-mono font-bold">
            Why Choose MongoDB Browser?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built specifically for developers who need quick, secure access to
            their MongoDB data without the complexity of traditional tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-border/50"
            >
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="font-mono text-lg">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
