"use client";
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
    <section className="relative py-16 sm:py-20 lg:py-24 bg-muted/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4 sm:space-y-6">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold leading-tight">
              <span className="block sm:inline">Why Choose</span>{" "}
              <span className="block sm:inline text-primary">
                MongoDB Browser?
              </span>
            </h2>
          </div>
          <div className="animate-fade-in-up animate-delay-200">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Built specifically for developers who need quick, secure access to
              their MongoDB data without the complexity of traditional tools.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="animate-fade-in-up group"
              style={{
                animationDelay: `${(index % 3) * 100 + 400}ms`,
              }}
            >
              <Card
                className="
              relative h-full
              group hover:shadow-xl transition-all duration-300
              hover:-translate-y-2
              border-border/50 bg-background/80 backdrop-blur-sm
            "
              >
                <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-5">
                  <div
                    className="
                  w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14
                  rounded-lg bg-primary/10
                  flex items-center justify-center mb-2 sm:mb-3
                  group-hover:bg-primary/20 transition-colors duration-300
                "
                  >
                    <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
                  </div>
                  <CardTitle className="font-mono text-sm sm:text-base lg:text-lg">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-4 sm:p-5">
                  <CardDescription className="text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20 animate-fade-in-up animate-delay-1000">
          <p className="text-xs sm:text-sm text-muted-foreground/60 font-mono">
            No installation • No registration • No data sharing
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-delay-200 {
          animation-delay: 200ms;
        }

        .animate-delay-1000 {
          animation-delay: 1000ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
