import { useState, useEffect } from "react";
import LanguageSelector from "../snippets/LanguageSelector";
import CodeEditor from "../snippets/CodeEditor";
import { useAppSelector } from "../../hooks/reduxHooks";

const SnippetForm = ({ snippetToEdit, onClose }) => {
  const { collections } = useAppSelector((state) => state.collections); // assumes you have a slice for collections
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding...");
  const [collectionId, setCollectionId] = useState("");

  useEffect(() => {
    if (snippetToEdit) {
      setLanguage(snippetToEdit.language);
      setCode(snippetToEdit.content);
      setCollectionId(snippetToEdit.collectionId || "");
    }
  }, [snippetToEdit]);

  return (
    <div className="space-y-4">
      <LanguageSelector value={language} onChange={setLanguage} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Collection
        </label>
        <select
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">None</option>
          {collections.map((col) => (
            <option key={col._id} value={col._id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <CodeEditor value={code} onChange={setCode} language={language} />

      <div className="flex justify-end gap-3 pt-4">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          {snippetToEdit ? "Update Snippet" : "Create Snippet"}
        </button>
      </div>
    </div>
  );
};

export default SnippetForm;
