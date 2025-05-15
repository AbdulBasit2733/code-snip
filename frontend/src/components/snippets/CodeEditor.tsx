// src/components/snippets/CodeEditor.jsx

import { useEffect, useState, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { useWebSocket } from '../../hooks/useWebSocket';
import CollaborationIndicator from './CollaborationIndicator';

// Map of supported languages to their extensions
const languageExtensions = {
  javascript: javascript(),
  python: python(),
  html: html(),
  css: css(),
  cpp: cpp(),
};

const CodeEditor = ({ snippetId, initialCode = '', language = 'javascript', onCodeChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const lastUpdateRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Connect to WebSocket for this snippet
  const { connected, collaborators, sendCodeChange, codeUpdates } = useWebSocket(snippetId);

  // Set up CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;
    
    const languageExtension = languageExtensions[language] || languageExtensions.javascript;
    
    // Create the editor state
    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        languageExtension,
        oneDark,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            lastUpdateRef.current = newCode;
            
            // Mark that the user is typing
            setUserIsTyping(true);
            
            // Clear any existing debounce timer
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            
            // Debounce sending updates to reduce network traffic
            debounceTimerRef.current = setTimeout(() => {
              if (onCodeChange) {
                onCodeChange(newCode);
              }
              
              if (connected && snippetId) {
                sendCodeChange(snippetId, newCode);
              }
              
              setUserIsTyping(false);
            }, 500);
          }
        })
      ]
    });
    
    // Create the editor view
    const view = new EditorView({
      state,
      parent: editorRef.current
    });
    
    viewRef.current = view;
    setIsEditorReady(true);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      view.destroy();
    };
  }, [language, editorRef, initialCode]);
  
  // Handle code updates from other users
  useEffect(() => {
    if (viewRef.current && codeUpdates && !userIsTyping && codeUpdates !== lastUpdateRef.current) {
      const currentPos = viewRef.current.state.selection.main.head;
      
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: codeUpdates
        }
      });
      
      // Try to maintain cursor position after updates
      viewRef.current.dispatch({
        selection: { anchor: Math.min(currentPos, codeUpdates.length) }
      });
      
      lastUpdateRef.current = codeUpdates;
    }
  }, [codeUpdates, userIsTyping]);

  return (
    <div className="flex flex-col rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary">
        <div className="text-sm font-medium text-secondary-foreground">
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </div>
        
        <CollaborationIndicator 
          connected={connected}
          collaborators={collaborators}
          isTyping={userIsTyping}
        />
      </div>
      
      <div 
        ref={editorRef} 
        className="w-full h-full min-h-96 overflow-auto"
      />
    </div>
  );
};

export default CodeEditor;