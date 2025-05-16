import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import CodeEditor from "../components/snippets/CodeEditor";

const Editor = () => {
  const { id } = useParams();
  const { snippets } = useAppSelector((state) => state.snippets);

  const snippetToEdit = snippets.find((snippet) => snippet._id === id);
  const [code, setCode] = useState(snippetToEdit?.content || "");

  if (!snippetToEdit) {
    return <p className="text-center text-gray-500">Snippet not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{snippetToEdit.title}</h1>
      <CodeEditor
        value={code}
        onChange={setCode}
        language={snippetToEdit.language || "javascript"}
      />
    </div>
  );
};

export default Editor;
