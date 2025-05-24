import React, { useState, useEffect } from "react";
import {
  Users,
  Wifi,
  WifiOff,
  Globe,
  Lock,
  Copy,
  Share2,
  Settings,
  Moon,
  Sun,
  Circle,
  Code2,
} from "lucide-react";
import CodeRoomClient from "./CodeRoomClient";
import { getCodeBySnippetId } from "../../redux/code-slice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useParams } from "react-router-dom";
import type { Snippet } from "../../types/Snippets";

const SnippetHeaderUI = ({
  currentSnippet,
  isDarkTheme,
  setIsDarkTheme,
}: {
  currentSnippet: Snippet;
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
}) => {
  const [isLive, setIsLive] = useState(
    currentSnippet?.liveSession?.isLive || false
  );
  const [activeUsers, setActiveUsers] = useState(
    currentSnippet?.liveSession?.activeUsers || []
  );
  const [selectedLanguage] = useState(currentSnippet?.language || "javascript");

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive((prev) => (Math.random() > 0.1 ? true : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const languages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "csharp",
    "php",
    "ruby",
    "go",
    "rust",
    "html",
    "css",
    "json",
    "yaml",
  ];

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, string> = {
      javascript: "🟨",
      typescript: "🔷",
      python: "🐍",
      java: "☕",
      cpp: "⚡",
      csharp: "🔹",
      php: "🐘",
      ruby: "💎",
      go: "🐹",
      rust: "🦀",
      html: "🌐",
      css: "🎨",
      json: "📋",
      yaml: "📄",
    };
    return icons[lang] || "📝";
  };

  const themeClasses = isDarkTheme
    ? "bg-gray-900 text-white border-gray-700"
    : "bg-white text-gray-900 border-gray-200";

  return (
    <div
      className={`w-full border-b transition-all duration-300 ${themeClasses}`}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-blue-500" />
              <span>{currentSnippet?.title || "Untitled Snippet"}</span>
            </h1>
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isLive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {isLive ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span>{isLive ? "Live" : "Offline"}</span>
              <Circle
                className={`w-2 h-2 fill-current ${
                  isLive ? "text-green-500" : "text-red-500"
                }`}
              />
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              {isDarkTheme ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Language:</span>
            {languages.map((lang) => (
              <div key={lang}>
                {lang === selectedLanguage && getLanguageIcon(lang)}{" "}
                {lang === selectedLanguage &&
                  lang.charAt(0).toUpperCase() + lang.slice(1)}
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-300">
            <strong>Collaborators:</strong>{" "}
            {currentSnippet?.collaborators?.length > 0 ? (
              currentSnippet.collaborators.map((collab, index) => (
                <span key={index} className="mr-4 inline-block">
                  {collab.user?.username || collab.user?.email} (
                  {collab.permission})
                </span>
              ))
            ) : (
              <span>None</span>
            )}
          </div>

          <div className="text-sm text-gray-300">
            <strong>Active Users:</strong>{" "}
            {activeUsers?.length > 0 ? (
              activeUsers.map((user, i) => {
                const activeU = currentSnippet.collaborators.find(
                  (u) => u.user._id === user._id
                );
                return (
                  <span key={i} className="mr-2 inline-block">
                    {activeU?.user?.username || activeU?.user?.email}
                  </span>
                );
              })
            ) : (
              <span>None</span>
            )}
          </div>
        </div>

        {currentSnippet?.collection && (
          <div className="mt-4 text-sm text-gray-400">
            <div>
              <strong>Collection:</strong> {currentSnippet.collection.name}
            </div>
            <div>{currentSnippet.collection.description}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const CodeRoom = () => {
  const params = useParams();
  const { snippetId } = params;
  const dispatch = useAppDispatch();

  const { code } = useAppSelector((state) => state.code);
  const { snippets } = useAppSelector((state) => state.snippets);
  const currentSnippet = snippets?.find((sn) => sn?._id === snippetId);

  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const handleDarkTheme = (value: boolean) => setIsDarkTheme(value);

  useEffect(() => {
    if (snippetId) {
      dispatch(getCodeBySnippetId(snippetId));
    }
  }, [dispatch, snippetId]);

  if (!snippetId) return <div className="p-4">❗ Invalid Snippet ID.</div>;
  if (!currentSnippet) return <div className="p-4">❗ Snippet not found.</div>;

  return (
    <div>
      <SnippetHeaderUI
        currentSnippet={currentSnippet}
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={handleDarkTheme}
      />
      <CodeRoomClient
        theme={isDarkTheme ? "dark" : "white"}
        codes={code}
        currentSnippet={currentSnippet}
      />
    </div>
  );
};

export default CodeRoom;
