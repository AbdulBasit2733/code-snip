import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../../hooks/useSocket";
import { type CodeProps } from "../../redux/code-slice";
import type { Snippet } from "../../types/Snippets";

import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import {
  Play,
  Save,
  Download,
  Copy,
  Users,
  Wifi,
  WifiOff,
  Settings,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  User,
  Terminal,
  Search,
  Zap,
} from "lucide-react";
import { getLanguageExtension } from "../../lib/utils";

interface CodeRoomClientProps {
  codes: CodeProps[];
  currentSnippet: Snippet;
  theme: "dark" | "white";
}

const CodeRoomClient = ({
  codes,
  currentSnippet,
  theme,
}: CodeRoomClientProps) => {
  const snippetId = currentSnippet?._id;
  const { loading, socket } = useSocket();

  const [codeList, setCodeList] = useState(codes || []);
  const [currentCode, setCurrentCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState("");

  const editorRef = useRef<null | ReactCodeMirrorRef>(null);
  const lastChangeRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize code from the latest code entry or empty
  useEffect(() => {
    if (codes && codes.length > 0) {
      // Get the most recent code entry
      const latestCode = codes.reduce((latest, current) =>
        new Date(current.timestamp) > new Date(latest.timestamp)
          ? current
          : latest
      );
      setCurrentCode(latestCode.code || "// Start coding here...\n\n");
    } else {
      setCurrentCode(`// Welcome to ${currentSnippet?.title || "CodeRoom"}
// Language: ${currentSnippet?.language || "JavaScript"}
// Start typing to collaborate in real-time!

function example() {
  console.log("Hello, CodeRoom!");
  return "Ready to code together!";
}

example();
`);
    }
  }, [codes, currentSnippet]);

  // WebSocket connection and message handling
  useEffect(() => {
    if (socket && !loading && snippetId) {
      // Join the snippet room
      socket.send(
        JSON.stringify({
          type: "join_snippet",
          snippetId,
        })
      );
      console.log("✅ Joined snippet:", snippetId);
      setIsConnected(true);

      // Handle incoming messages
      socket.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);

          if (parsedData.type === "code_change") {
            // Apply remote changes to the editor
            setCodeList((prev) => [...prev, parsedData]);

            // Only update current code if it's from another user
            if (parsedData.userId !== "current-user") {
              setCurrentCode(parsedData.code);
            }
          }
        } catch (err) {
          console.error("❌ Failed to parse socket message:", err);
        }
      };

      // Handle connection close
      socket.onclose = () => {
        setIsConnected(false);
        console.log("🔌 WebSocket connection closed");
      };

      socket.onerror = (error) => {
        setIsConnected(false);
        console.error("❌ WebSocket error:", error);
      };
    }

    return () => {
      if (socket && snippetId) {
        socket.send(
          JSON.stringify({
            type: "leave_snippet",
            snippetId,
          })
        );
        socket.onmessage = null;
      }
    };
  }, [loading, socket, snippetId]);

  // Handle code changes with debouncing
  const handleCodeChange = useCallback(
    (value, viewUpdate) => {
      setCurrentCode(value);

      // Clear existing timeout
      if (lastChangeRef.current) {
        clearTimeout(lastChangeRef.current);
      }

      // Debounce sending changes to avoid spam
      lastChangeRef.current = setTimeout(() => {
        if (socket && isConnected && value !== currentCode) {
          try {
            socket.send(
              JSON.stringify({
                type: "code_change",
                snippetId,
                code: value,
                action: "update",
                startLine: 0,
                endLine: value.split("\n").length,
              })
            );
          } catch (err) {
            console.error("❌ Error sending code change:", err);
          }
        }
      }, 500); // 500ms debounce

      // Auto-save after 2 seconds of no changes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    },
    [socket, isConnected, snippetId, currentCode]
  );

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!currentCode.trim()) return;

    setIsSaving(true);
    try {
      setLastSaved(new Date());
      console.log("💾 Auto-saved at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentCode, snippetId]);

  // Manual save
  const handleSave = async () => {
    await handleAutoSave();
  };

  // Run code (mock implementation)
  const handleRun = () => {
    setShowOutput(true);
    setOutput("🚀 Running code...\n");

    // Mock execution delay
    setTimeout(() => {
      if (currentSnippet?.language === "javascript") {
        try {
          // This is a very basic mock - in production, you'd send to a code execution service
          const result = eval(currentCode);
          setOutput(
            (prev) => prev + `✅ Execution completed\nResult: ${result}\n`
          );
        } catch (error) {
          const errorMessage =
            error && typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : String(error);
          setOutput((prev) => prev + `❌ Error: ${errorMessage}\n`);
        }
      } else {
        setOutput(
          (prev) =>
            prev +
            `📝 Code execution for ${currentSnippet?.language} is not implemented in this demo\n`
        );
      }
    }, 1000);
  };

  // Download code
//   const handleDownload = () => {
//     const element = document.createElement("a");
//     const file = new Blob([currentCode], { type: "text/plain" });
//     element.href = URL.createObjectURL(file);

//     const extension =
//       {
//         javascript: "js",
//         typescript: "ts",
//         python: "py",
//         html: "html",
//         css: "css",
//         json: "json",
//       }[currentSnippet?.language] || "txt";

//     element.download = `${currentSnippet?.title || "snippet"}.${extension}`;
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//   };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      console.log("📋 Code copied to clipboard");
      // You could add a toast notification here
    } catch (err) {
      console.error("❌ Failed to copy:", err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Theme configuration
  const isDark = theme === "dark";
  const themeClasses = isDark
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900";

  const toolbarClasses = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-50 border-gray-200";

  const sidebarClasses = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-100 border-gray-200";

  // Editor extensions
  const editorExtensions = [
    getLanguageExtension(currentSnippet?.language || "javascript"),
    EditorView.theme({
      "&": {
        fontSize: "14px",
        fontFamily:
          '"Fira Code", "JetBrains Mono", "Monaco", "Cascadia Code", monospace',
        height: "100%",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-editor": {
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily: "inherit",
        lineHeight: "1.5",
      },
      ".cm-gutters": {
        backgroundColor: isDark ? "#1f2937" : "#f9fafb",
        borderRight: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      },
      ".cm-activeLineGutter": {
        backgroundColor: isDark ? "#374151" : "#e5e7eb",
      },
    }),
    EditorView.lineWrapping,
  ];

  if (isDark) {
    editorExtensions.push(oneDark);
  }

  return (
    <div
      className={`flex flex-col h-screen ${
        isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-200px)]"
      } ${themeClasses}`}
    >
      {/* Toolbar */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${toolbarClasses} border-gray-200 dark:border-gray-700`}
      >
        {/* Left: Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRun}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800"
                : "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Save (Ctrl+S)"
          >
            <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>

          <div className="w-px h-6 bg-gray-400 mx-2" />

          {/* <button
            onClick={handleDownload}
            className={`p-1.5 rounded transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title="Download File"
          >
            <Download className="w-4 h-4" />
          </button> */}

          <button
            onClick={handleCopy}
            className={`p-1.5 rounded transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title="Copy to Clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowOutput(!showOutput)}
            className={`p-1.5 rounded transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } ${showOutput ? "bg-blue-600 text-white" : ""}`}
            title="Toggle Output Panel"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Connection Status */}
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${
              isConnected
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {isConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{currentSnippet?.liveSession?.activeUsers?.length || 0}</span>
          </div>
        </div>

        {/* Right: View Controls */}
        <div className="flex items-center space-x-2">
          <button
            className={`p-1.5 rounded transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title="Search (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            className={`p-1.5 rounded transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded transition-colors ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className={`${showOutput ? "flex-1" : "flex-1"} flex flex-col`}>
          <div className="flex-1 relative">
            <CodeMirror
              ref={editorRef}
              value={currentCode}
              onChange={handleCodeChange}
              extensions={editorExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: true,
                searchKeymap: true,
              }}
              className="h-full"
              placeholder="Start typing your code here..."
            />
          </div>

          {/* Status Bar */}
          <div
            className={`flex items-center justify-between px-4 py-1 border-t text-xs ${toolbarClasses} border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>{currentSnippet?.language || "javascript"}</span>
              </span>
              <span>Lines: {currentCode.split("\n").length}</span>
              <span>Characters: {currentCode.length}</span>
              <span>
                Words:{" "}
                {currentCode.split(/\s+/).filter((w) => w.length > 0).length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {isSaving && (
                <span className="flex items-center space-x-1 text-blue-600">
                  <Zap className="w-3 h-3 animate-pulse" />
                  <span>Saving...</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Saved: {lastSaved.toLocaleTimeString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        {showOutput && (
          <div
            className={`w-96 border-l flex flex-col ${sidebarClasses} border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold flex items-center space-x-1">
                <Terminal className="w-4 h-4" />
                <span>Output</span>
              </h3>
              <button
                onClick={() => setOutput("")}
                className={`text-xs px-2 py-1 rounded ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-3 font-mono text-sm overflow-y-auto">
              <pre className="whitespace-pre-wrap">
                {output || "No output yet. Click 'Run' to execute your code."}
              </pre>
            </div>
          </div>
        )}

        {/* Activity Sidebar */}
        <div
          className={`w-64 border-l flex flex-col ${sidebarClasses} border-gray-200 dark:border-gray-700`}
        >
          {/* Active Users */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>
                Active Users (
                {currentSnippet?.liveSession?.activeUsers?.length || 0})
              </span>
            </h3>
            <div className="space-y-2">
              {currentSnippet?.collaborators?.map((collab, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>{collab.user?.username || collab.user?.email}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {collab.permission}
                  </span>
                </div>
              ))}
              {(!currentSnippet?.collaborators ||
                currentSnippet.collaborators.length === 0) && (
                <div className="text-sm text-gray-500">
                  No active collaborators
                </div>
              )}
            </div>
          </div>

          {/* Recent Changes */}
          <div className="flex-1 p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Recent Changes</span>
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {codeList
                .slice(-10)
                .reverse()
                .map((change, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-1 mb-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">
                        {change.userId?.name || "You"}
                      </span>
                      <span className="text-gray-500">{change.action}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 truncate">
                      {change.code?.substring(0, 50)}
                      {change.code?.length > 50 ? "..." : ""}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              {codeList.length === 0 && (
                <div className="text-sm text-gray-500">No recent changes</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRoomClient;
