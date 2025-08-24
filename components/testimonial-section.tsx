"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  image: string;
  quote: string;
  role: string;
  company: string;
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    company: "TechStartup Inc.",
    role: "Senior Developer",
    image: "https://peerlist.io/images/emptyDP.png",
    quote:
      "MongoDB Browser has completely changed how we debug and manage our database. The fact that it runs entirely in the browser with no data leaving our machine is a game-changer for security.",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    company: "DataFlow Systems",
    role: "Backend Engineer",
    image: "https://peerlist.io/images/emptyDP.png",
    quote:
      "Finally, a MongoDB tool that doesn't require complicated setup! I can connect to any database instantly and start working. It's become an essential part of my development workflow.",
  },
  {
    id: "3",
    name: "Emily Johnson",
    company: "CloudNative Co.",
    role: "DevOps Lead",
    image: "https://peerlist.io/images/emptyDP.png",
    quote:
      "The simplicity and privacy-first approach is exactly what we needed. Our team can now safely browse production data without worrying about security compliance.",
  },
  {
    id: "4",
    name: "Alex Kim",
    company: "FinTech Solutions",
    role: "Full Stack Developer",
    image: "https://peerlist.io/images/emptyDP.png",
    quote:
      "The intuitive interface and blazing-fast performance make MongoDB Browser my go-to tool for database management. It's saved us countless hours.",
  },
  {
    id: "5",
    name: "Jessica Liu",
    company: "AI Innovations",
    role: "Data Engineer",
    image: "https://peerlist.io/images/emptyDP.png",
    quote:
      "Being able to export and manipulate data directly in the browser without any server-side processing is fantastic for our compliance requirements.",
  },
  {
    id: "6",
    name: "David Thompson",
    company: "E-commerce Plus",
    role: "Tech Lead",
    image: "https://peerlist.io/images/emptyDP.png",
    quote:
      "MongoDB Browser has revolutionized our debugging process. The smart search and filtering capabilities are incredibly powerful.",
  },
];

// Helper function to clean and format HTML content
function cleanHtmlContent(html: string): string {
  // Remove HTML tags but preserve line breaks
  return html
    .replace(/<br\s*\/?>/gi, " ") // Replace br tags with space
    .replace(/<\/p>/gi, " ") // Replace closing p tags with space
    .replace(/<[^>]*>/g, "") // Remove all other HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#039;/g, "'") // Replace &#039; with '
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
}

export function TestimonialSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(fallbackTestimonials);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/peerlist-supporters/comments");
        if (response.ok) {
          const data = await response.json();
          if (data.testimonials && data.testimonials.length > 0) {
            // Ensure we have at least 6 testimonials for smooth scrolling
            let fetchedTestimonials = data.testimonials;
            while (fetchedTestimonials.length < 6) {
              fetchedTestimonials = [
                ...fetchedTestimonials,
                ...data.testimonials,
              ];
            }
            setTestimonials(fetchedTestimonials.slice(0, 10));
          }
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4 sm:space-y-6">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold leading-tight">
              <span className="block sm:inline">Loved by</span>{" "}
              <span className="block sm:inline text-primary">
                Developers Worldwide
              </span>
            </h2>
          </div>
          <div className="animate-fade-in-up animate-delay-200">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              See what developers are saying about MongoDB Browser
            </p>
          </div>
          <div className="animate-fade-in-up animate-delay-200 mt-4">
            <a
              href="/peerlist-supporters"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm sm:text-base"
            >
              View all supporters
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Infinite scrolling carousel */}
        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient masks for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            className={`flex gap-6 ${isPaused ? "animation-paused" : ""} infinite-scroll`}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="flex-shrink-0 w-[350px] md:w-[400px]"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50 bg-background/80 backdrop-blur-sm cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-muted">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="object-cover w-24 h-24"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg font-semibold">
                          {testimonial.name}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {testimonial.role} at {testimonial.company}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                      "{cleanHtmlContent(testimonial.quote)}"
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Second row scrolling in opposite direction NOT NEEDED AS OF NOW */}
        {/*<div*/}
        {/*  className="relative w-full overflow-hidden mt-6"*/}
        {/*  onMouseEnter={() => setIsPaused(true)}*/}
        {/*  onMouseLeave={() => setIsPaused(false)}*/}
        {/*>*/}
        {/*  /!* Gradient masks for fade effect *!/*/}
        {/*  <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />*/}
        {/*  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />*/}

        {/*  <div*/}
        {/*    className={`flex gap-6 ${isPaused ? "animation-paused" : ""} infinite-scroll-reverse`}*/}
        {/*  >*/}
        {/*    {[...testimonials]*/}
        {/*      .reverse()*/}
        {/*      .concat([...testimonials].reverse())*/}
        {/*      .map((testimonial, index) => (*/}
        {/*        <div*/}
        {/*          key={`${testimonial.id}-reverse-${index}`}*/}
        {/*          className="flex-shrink-0 w-[350px] md:w-[400px]"*/}
        {/*        >*/}
        {/*          <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50 bg-background/80 backdrop-blur-sm cursor-pointer">*/}
        {/*            <CardHeader className="pb-4">*/}
        {/*              <div className="flex items-center space-x-4">*/}
        {/*                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-muted">*/}
        {/*                  <img*/}
        {/*                    src={testimonial.image}*/}
        {/*                    alt={testimonial.name}*/}
        {/*                    width={56}*/}
        {/*                    height={56}*/}
        {/*                    className="object-cover w-24 h-24"*/}
        {/*                  />*/}
        {/*                </div>*/}
        {/*                <div className="flex-1">*/}
        {/*                  <CardTitle className="text-base sm:text-lg font-semibold">*/}
        {/*                    {testimonial.name}*/}
        {/*                  </CardTitle>*/}
        {/*                  <CardDescription className="text-xs sm:text-sm">*/}
        {/*                    {testimonial.role} at {testimonial.company}*/}
        {/*                  </CardDescription>*/}
        {/*                </div>*/}
        {/*              </div>*/}
        {/*            </CardHeader>*/}
        {/*            <CardContent>*/}
        {/*              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">*/}
        {/*                "{cleanHtmlContent(testimonial.quote)}"*/}
        {/*              </p>*/}
        {/*            </CardContent>*/}
        {/*          </Card>*/}
        {/*        </div>*/}
        {/*      ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .infinite-scroll {
          animation: scroll 40s linear infinite;
        }

        .infinite-scroll-reverse {
          animation: scroll-reverse 45s linear infinite;
        }

        .animation-paused {
          animation-play-state: paused;
        }

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

        @media (prefers-reduced-motion: reduce) {
          .infinite-scroll,
          .infinite-scroll-reverse {
            animation: none;
          }
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
