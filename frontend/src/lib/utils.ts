import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLanguageExtension(language: string) {
  switch (language) {
    case "javascript":
      return javascript();
    case "python":
      return python();
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
    default:
      return javascript(); // fallback
  }
}