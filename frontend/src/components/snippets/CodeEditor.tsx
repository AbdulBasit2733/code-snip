import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark } from "@uiw/codemirror-theme-github";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { cpp } from "@codemirror/lang-cpp"; // if available

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  html: html(),
  css: css(),
  cpp: cpp?.(), // make sure the cpp language is supported or use fallback
};

const CodeEditor = ({ value, onChange, language }) => {
  const extension = languageExtensions[language] || javascript();

  return (
    <CodeMirror
      value={value}
      height="400px"
      theme={githubDark}
      extensions={[extension]}
      onChange={(val) => onChange(val)}
      className="border rounded-md overflow-hidden"
    />
  );
};

export default CodeEditor;
