import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { toast } from "sonner";
import { createSnippet, getMySnippets } from "../../redux/snippet-slice";

const SnippetForm = ({ onClose, collections, snippetId }) => {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [collectionName, setCollectionName] = useState("");

  const dispatch = useAppDispatch();
  const { snippets } = useAppSelector((state) => state.snippets);

  const languages = [
    "javascript",
    "python",
    "java",
    "c++",
    "css",
    "html",
    "sql",
    "go",
    "rust",
    "typescript",
  ];

  useEffect(() => {
    if (snippetId && snippets.length > 0) {
      const existing = snippets.find((s) => s._id === snippetId);
      if (existing) {
        setTitle(existing.title || "");
        setLanguage(
          languages.find(
            (lang) =>
              lang.toLowerCase() === existing.language?.toLowerCase()
          ) || ""
        );

        const colId =
          typeof existing.collection === "object"
            ? existing.collection?._id
            : existing.collection;

        const foundCollection = collections.find((c) => c._id === colId);

        setCollectionId(colId || "");
        setCollectionName(foundCollection?.name || "");
      }
    }
  }, [snippetId, snippets, collections]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const snippetData = {
      title,
      language,
      collectionId,
    };

    if (!title || !language) {
      toast.error("All Fields are required");
      return;
    }

    dispatch(createSnippet(snippetData)).then((data) => {
      if (data.payload?.success) {
        toast.success(data.payload.message);
        dispatch(getMySnippets());
        onClose();
      } else {
        toast.error(data.payload?.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter snippet title"
          required
        />
      </div>

      <div>
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="collection">Collection</Label>
        <Select
          value={collectionId}
          onValueChange={(value) => {
            setCollectionId(value);
            const selectedCollection = collections.find(
              (c) => c._id === value
            );
            setCollectionName(selectedCollection?.name || "");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a collection (optional)" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection._id} value={collection._id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {snippetId ? "Update Snippet" : "Create Snippet"}
        </Button>
      </div>
    </form>
  );
};

export default SnippetForm;
