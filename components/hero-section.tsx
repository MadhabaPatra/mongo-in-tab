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

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden p-4">
      <AnimatedBackground />
      <div className="relative z-10 container text-center max-w-5xl mx-auto">
        <div className="space-y-12">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-mono font-bold tracking-tight leading-tight animate-fade-in-scale">
            Explore and Manage Your MongoDB
            <span className="block text-primary mt-2">
              Directly in Your Browser
            </span>
          </h1>

          <p className="font-mono text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            Instantly explore your collections {"& "}
            documents. all data stays{" "}
            <span className="block text-primary font-semibold">
              100% private—stored only in your browser.
            </span>
          </p>
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-scale animate-delay-400">
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
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <Terminal className="w-4 h-4 text-slate-400 ml-2" />
                  <span className="text-sm text-slate-400 font-mono">
                    MongoDB Connection
                  </span>
                </div>
                {validationError && activeTab === "connect" && (
                  <div className="flex items-center space-x-1 text-red-400 text-xs animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span className="font-mono">ERROR</span>
                  </div>
                )}
              </div>

              <div className="flex border-b border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => setActiveTab("connect")}
                  className={`px-4 py-2 text-sm font-mono transition-colors ${
                    activeTab === "connect"
                      ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Connect
                </button>
                <button
                  onClick={() => setActiveTab("formats")}
                  className={`px-4 py-2 text-sm font-mono transition-colors ${
                    activeTab === "formats"
                      ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Supported Formats
                </button>
              </div>

              {activeTab === "connect" ? (
                <div className="p-4 font-mono text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-400">$</span>
                    <span className="text-blue-400">
                      Paste your Connection URL below:
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-5 opacity-100`}></span>
                    {/*<span className="text-blue-400">Connection URL:</span>*/}
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={mongoUrl}
                        onChange={(e) => handleUrlChange(e as any)}
                        placeholder={
                          mongoUrl
                            ? ""
                            : "mongodb://username:password@cluster.mongodb.net/database"
                        }
                        className="w-full bg-transparent text-white placeholder-slate-500 outline-none border-none font-mono text-sm placeholder:animate-pulse resize-none overflow-hidden min-h-[20px]"
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
                      />

                      {/*<input*/}
                      {/*  ref={inputRef}*/}
                      {/*  type="text"*/}
                      {/*  value={mongoUrl}*/}
                      {/*  onChange={handleUrlChange}*/}
                      {/*  placeholder="mongodb://username:password@cluster.mongodb.net/database"*/}
                      {/*  className="w-full bg-transparent text-white placeholder-slate-500 outline-none border-none font-mono text-sm placeholder:animate-pulse"*/}
                      {/*  autoFocus*/}
                      {/*/>*/}
                    </div>
                  </div>
                  {validationError ? (
                    <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500">✗</span>
                        <span>Connection failed: {validationError}</span>
                      </div>
                    </div>
                  ) : mongoUrl && !validationError ? (
                    <div className="mt-3 p-2 bg-green-900/20 border border-green-500/30 rounded text-green-400 text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Connection string validated</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-4 font-mono text-sm space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">
                      Supported Connection String Formats
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-yellow-400 text-xs mb-1">
                        Standard Connection String:
                      </div>
                      <div className="text-slate-300 text-xs bg-slate-800 p-2 rounded border-l-2 border-yellow-400">
                        mongodb://[username:password@]host[:port][/database]
                      </div>
                    </div>

                    <div>
                      <div className="text-green-400 text-xs mb-1">
                        MongoDB Atlas (SRV):
                      </div>
                      <div className="text-slate-300 text-xs bg-slate-800 p-2 rounded border-l-2 border-green-400">
                        mongodb+srv://[username:password@]host[/database]
                      </div>
                    </div>

                    <div>
                      <div className="text-purple-400 text-xs mb-1">
                        With Options:
                      </div>
                      <div className="text-slate-300 text-xs bg-slate-800 p-2 rounded border-l-2 border-purple-400">
                        mongodb://host/database?retryWrites=true&w=majority
                      </div>
                    </div>

                    <div className="mt-4 p-2 bg-orange-900/20 border border-orange-500/30 rounded">
                      <div className="flex items-center space-x-2 text-orange-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>
                          Note: Localhost connections are not supported. Use{" "}
                          <a
                            className="underline font-bold"
                            href={
                              "https://github.com/MadhabaPatra/mongo-in-tab"
                            }
                          >
                            Github
                          </a>{" "}
                          for local use.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animate-delay-600 pt-8">
              <Button
                size="lg"
                className="text-base px-8 py-6 h-14 group min-w-[180px] cursor-pointer"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {!isConnecting ? (
                  <>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span>Connect Database</span>
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
                className="text-base px-8 py-6 h-14 group bg-background/80 backdrop-blur-sm min-w-[180px] cursor-pointer hover:bg-transparent hover:text-primary"
                disabled={isConnecting}
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:text-primary transition-all" />
                Try Sample Database
              </Button>
            </div>
          </div>

          {/*<div className="pt-4 animate-fade-in-up animate-delay-800">*/}
          {/*  <div className="flex flex-wrap justify-center gap-3">*/}
          {/*    <div className="inline-flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium rounded-md">*/}
          {/*      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>*/}
          {/*      Secure*/}
          {/*    </div>*/}
          {/*    <div className="inline-flex items-center px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-sm font-medium rounded-md">*/}
          {/*      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>*/}
          {/*      Browser-based*/}
          {/*    </div>*/}
          {/*    <div className="inline-flex items-center px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium rounded-md">*/}
          {/*      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>*/}
          {/*      No login required*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
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
            transform: translateX(-8px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(8px);
          }
        }

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
      `}</style>
    </section>
  );
}
