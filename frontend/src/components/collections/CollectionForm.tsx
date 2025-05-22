import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  createCollection,
  fetchCollections,
} from "../../redux/collection-slice";
import { useAppDispatch } from "../../hooks/reduxHooks";

const CollectionForm = ({ onClose, snippets }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSnippets, setSelectedSnippets] = useState([]);
  const dispatch = useAppDispatch();
  // const toggleSnippet = (snippetId) => {
  //   setSelectedSnippets((prev) =>
  //     prev.includes(snippetId)
  //       ? prev.filter((id) => id !== snippetId)
  //       : [...prev, snippetId]
  //   );
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    const collectionData = {
      name,
      description,
      snippetIds: selectedSnippets,
    };
    if (!collectionData.name || !collectionData.description) {
      toast.error("All fields are required");
    }
    dispatch(createCollection(collectionData)).then((data) => {
      if (data.payload?.success) {
        toast.success(data.payload.message);
        dispatch(fetchCollections());
        onClose();
      } else {
        toast.error(data.payload?.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Collection Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter collection name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter collection description"
          rows={3}
          required
        />
      </div>

      {/* <div>
        <Label>Add Snippets (Optional)</Label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`snippet-${snippet._id}`}
                checked={selectedSnippets.includes(snippet._id)}
                onChange={() => toggleSnippet(snippet._id)}
              />
              <label
                htmlFor={`snippet-${snippet._id}`}
                className="text-sm flex-1"
              >
                {snippet.title} ({snippet.language})
              </label>
            </div>
          ))}
        </div>
      </div> */}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Collection</Button>
      </div>
    </form>
  );
};

export default CollectionForm;
