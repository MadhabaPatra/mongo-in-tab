"use client";

import type React from "react";
import { Button } from "@/components/ui/button";

import {
  ArrowRight,
  Play,
  Terminal,
  AlertCircle,
  Info,
  LoaderCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { AnimatedBackground } from "@/components/animated-background";
import { validateUrl } from "@/lib/utils";
import { testMongoConnection } from "@/lib/mongodb";
import { StorageManager } from "@/lib/storage";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  const [mongoUrl, setMongoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [isShaking, setIsShaking] = useState(false);
  const [activeTab, setActiveTab] = useState<"connect" | "formats">("connect");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMongoUrl(value);

    const validationError = validateUrl(value);
    setValidationError(validationError);
  };

  const handleConnect = async () => {
    if (!!validationError || !mongoUrl.trim()) {
      setActiveTab("connect");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      inputRef.current?.focus();
    } else {
      // Now Test the connection url
      setIsConnecting(true);
      try {
        const response = await testMongoConnection(mongoUrl);

        if (!response.success) {
          setValidationError(response?.message || "Something went wrong");
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 600);
          inputRef.current?.focus();
        } else {
          // Successfully connected
          const addedConnection = StorageManager.addConnection(mongoUrl);

          // Redirect to
          router.push("/app/databases?connectionId=" + addedConnection);
        }
      } catch (e) {
        setValidationError("Something went wrong, Please try agan later.");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const onClickSampleDatabase = () => {
    const connection = StorageManager.loadSampleConnection();
    router.push("/app/databases?connectionId=" + connection);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden p-2 sm:p-4 md:p-6">
      <AnimatedBackground />
      <div className="relative z-10 container text-center w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 md:space-y-12">
          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-mono font-bold tracking-tight leading-tight animate-fade-in-scale px-2 sm:px-0">
            <span className="block">Explore and Manage Your MongoDB</span>
            <span className="block text-primary mt-1 md:mt-2">
              Directly in Your Browser
            </span>
          </h1>

          <p className="font-mono text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200 px-2 sm:px-0">
            <span className="block sm:inline">
              Instantly explore your collections {"& "} documents.
            </span>{" "}
            <span className="block sm:inline">all data stays</span>{" "}
            <span className="block text-primary font-semibold mt-1 sm:mt-0">
              100% private—stored only in your browser.
            </span>
          </p>

          <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fade-in-scale animate-delay-400 px-2 sm:px-0">
            <div
              className={`relative bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden transition-all duration-150 ${
                isShaking
                  ? "animate-pulse border-red-500/50 shadow-red-500/20"
                  : ""
              }`}
              style={{
                transform: isShaking ? "translateX(0)" : "translateX(0)",
                animation: isShaking ? "shake 0.6s ease-in-out" : "none",
              }}
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1 sm:space-x-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 ml-1 sm:ml-2" />
                  <span className="text-xs sm:text-sm text-slate-400 font-mono hidden sm:inline">
                    MongoDB Connection
                  </span>
                  <span className="text-xs text-slate-400 font-mono sm:hidden">
                    MongoDB
                  </span>
                </div>
                {validationError && activeTab === "connect" && (
                  <div className="flex items-center space-x-1 text-red-400 text-xs animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span className="font-mono hidden sm:inline">ERROR</span>
                    <span className="font-mono sm:hidden">ERR</span>
                  </div>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("connect")}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "connect"
                      ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Connect
                </button>
                <button
                  onClick={() => setActiveTab("formats")}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "formats"
                      ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span className="hidden sm:inline">Supported Formats</span>
                  <span className="sm:hidden">Formats</span>
                </button>
              </div>

              {activeTab === "connect" ? (
                <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-400">$</span>
                    <span className="text-blue-400 text-xs sm:text-sm">
                      <span className="hidden sm:inline">
                        Paste your Connection URL below:
                      </span>
                      <span className="sm:hidden">Connection URL:</span>
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span
                      className={`w-2 h-5 opacity-100 flex-shrink-0`}
                    ></span>
                    <div className="flex-1 relative min-w-0">
                      <textarea
                        ref={inputRef}
                        value={mongoUrl}
                        onChange={(e) => handleUrlChange(e as any)}
                        placeholder={
                          mongoUrl
                            ? ""
                            : "mongodb://user:pass@cluster.mongodb.net/db"
                        }
                        className="w-full bg-transparent text-white placeholder-slate-500 outline-none border-none font-mono text-xs sm:text-sm placeholder:animate-pulse resize-none overflow-hidden min-h-[20px] leading-relaxed"
                        rows={1}
                        style={{
                          height: "auto",
                          minHeight: "20px",
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = target.scrollHeight + "px";
                        }}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                      />
                    </div>
                  </div>
                  {validationError ? (
                    <div className="mt-3 p-2 sm:p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs font-mono">
                      <div className="flex items-start space-x-2">
                        <span className="text-red-500 flex-shrink-0 mt-0.5">
                          ✗
                        </span>
                        <span className="break-words">
                          Connection failed: {validationError}
                        </span>
                      </div>
                    </div>
                  ) : mongoUrl && !validationError ? (
                    <div className="mt-3 p-2 sm:p-3 bg-green-900/20 border border-green-500/30 rounded text-green-400 text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Connection string validated</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-blue-400 text-xs sm:text-sm">
                      <span className="hidden sm:inline">
                        Supported Connection String Formats
                      </span>
                      <span className="sm:hidden">Supported Formats</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-yellow-400 text-xs mb-1">
                        Standard Connection String:
                      </div>
                      <div className="text-slate-300 text-xs bg-slate-800 p-2 rounded border-l-2 border-yellow-400 overflow-x-auto">
                        <code className="whitespace-nowrap block sm:whitespace-normal sm:break-all">
                          mongodb://[username:password@]host[:port][/database]
                        </code>
                      </div>
                    </div>

                    <div>
                      <div className="text-green-400 text-xs mb-1">
                        MongoDB Atlas (SRV):
                      </div>
                      <div className="text-slate-300 text-xs bg-slate-800 p-2 rounded border-l-2 border-green-400 overflow-x-auto">
                        <code className="whitespace-nowrap block sm:whitespace-normal sm:break-all">
                          mongodb+srv://[username:password@]host[/database]
                        </code>
                      </div>
                    </div>

                    <div>
                      <div className="text-purple-400 text-xs mb-1">
                        With Options:
                      </div>
                      <div className="text-slate-300 text-xs bg-slate-800 p-2 rounded border-l-2 border-purple-400 overflow-x-auto">
                        <code className="whitespace-nowrap block sm:whitespace-normal sm:break-all">
                          mongodb://host/database?retryWrites=true&w=majority
                        </code>
                      </div>
                    </div>

                    <div className="mt-4 p-2 sm:p-3 bg-orange-900/20 border border-orange-500/30 rounded">
                      <div className="flex items-start space-x-2 text-orange-400 text-xs">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          <span className="hidden sm:inline">
                            Note: Localhost connections are not supported. Use{" "}
                            <a
                              className="underline font-bold hover:text-orange-300 transition-colors"
                              href="https://github.com/MadhabaPatra/mongo-in-tab"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Github
                            </a>{" "}
                            for local use.
                          </span>
                          <span className="sm:hidden">
                            Localhost not supported. See{" "}
                            <a
                              className="underline font-bold hover:text-orange-300 transition-colors"
                              href="https://github.com/MadhabaPatra/mongo-in-tab"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Github
                            </a>{" "}
                            for local use.
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-fade-in-up animate-delay-600 pt-4 sm:pt-8">
              <Button
                size="lg"
                className="text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6 h-12 sm:h-14 group min-w-[160px] sm:min-w-[180px] cursor-pointer order-1"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {!isConnecting ? (
                  <>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Connect Database</span>
                    <span className="sm:hidden">Connect DB</span>
                  </>
                ) : (
                  <>
                    <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6 h-12 sm:h-14 group bg-background/80 backdrop-blur-sm min-w-[160px] sm:min-w-[180px] cursor-pointer hover:bg-transparent hover:text-primary order-2 sm:order-none"
                disabled={isConnecting}
                onClick={onClickSampleDatabase}
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:text-primary transition-all" />
                <span className="hidden sm:inline">Try Sample Database</span>
                <span className="sm:hidden">Try Sample DB</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/20 pointer-events-none" />
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }

        @media (min-width: 640px) {
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            10%,
            30%,
            50%,
            70%,
            90% {
              transform: translateX(-8px);
            }
            20%,
            40%,
            60%,
            80% {
              transform: translateX(8px);
            }
          }
        }

        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (min-width: 640px) {
          @keyframes fade-in-scale {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 640px) {
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
        }
      `}</style>
    </section>
  );
}
