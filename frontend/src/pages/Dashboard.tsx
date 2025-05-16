import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FolderPlus } from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";

import SearchBar from "../components/common/SearchBar";
import SnippetList from "../components/snippets/SnippetList";
import SnippetForm from "../components/snippets/SnippetForm";
import CollectionForm from "./CollectionForm";

import { fetchCollections } from "../redux/collection-slice";
import { getMySnippets } from "../redux/snippet-slice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";

import type { Snippet } from "../types/Snippets";
import type { Collection } from "../types/Collection";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);

  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);

  const [isSnippetFormOpen, setIsSnippetFormOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);

  const { collections } = useAppSelector((state) => state.collections);
  const { snippets, isLoading } = useAppSelector((state) => state.snippets);
console.log(collections);

  useEffect(() => {
    dispatch(fetchCollections());
    dispatch(getMySnippets());
  }, [dispatch]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      setFilteredSnippets(snippets);
    } else {
      setFilteredSnippets(
        snippets.filter((snippet) =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.language.toLowerCase().includes(query) ||
          (snippet.content?.toLowerCase().includes(query) ?? false)
        )
      );
    }
  }, [searchQuery, snippets]);

  const handleCreateSnippet = () => {
    setSnippetToEdit(null);
    setIsSnippetFormOpen(true);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setSnippetToEdit(snippet);
    setIsSnippetFormOpen(true);
  };

  const handleCloseSnippetForm = () => {
    setSnippetToEdit(null);
    setIsSnippetFormOpen(false);
  };

  const handleCreateCollection = () => {
    setCollectionToEdit(null);
    setIsCollectionFormOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setCollectionToEdit(collection);
    setIsCollectionFormOpen(true);
  };

  const handleCloseCollectionForm = () => {
    setCollectionToEdit(null);
    setIsCollectionFormOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCreateCollection}>
            <FolderPlus size={16} className="mr-2" />
            New Collection
          </Button>
          <Button onClick={handleCreateSnippet}>
            <Plus size={16} className="mr-2" />
            New Snippet
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="snippets" className="flex flex-col flex-1">
        <div className="px-6 py-3 border-b">
          <TabsList>
            <TabsTrigger value="snippets">Snippets</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Snippets */}
        <TabsContent value="snippets" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search snippets..."
            />
          </div>

          <div className="flex-1 px-6 pb-6 overflow-auto">
            <h2 className="text-lg font-medium my-3">All Snippets</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading snippets...</p>
              </div>
            ) : filteredSnippets.length > 0 ? (
              <SnippetList
                snippets={filteredSnippets}
                onEditSnippet={handleEditSnippet}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Search size={48} className="text-muted mb-4" />
                <h2 className="text-xl font-medium mb-2">No snippets found</h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No snippets match your search."
                    : "Create your first snippet to get started!"}
                </p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Collections */}
        <TabsContent value="collections" className="flex-1 overflow-auto px-6 py-4">
          <h2 className="text-lg font-medium mb-4">My Collections</h2>
          {collections.length > 0 ? (
            <div className="flex gap-4 flex-wrap">
              {collections.map((collection) => (
                <div
                  key={collection._id}
                  className="border rounded-lg p-4 bg-white shadow-sm w-64 cursor-pointer hover:border-blue-500"
                  onClick={() => navigate(`/collections/${collection._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-base truncate">{collection.name}</h3>
                    <button
                      className="text-xs text-gray-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCollection(collection);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {collection.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {collection.snippetIds.length} snippet
                    {collection.snippetIds.length !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No collections found.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CollectionForm
        isOpen={isCollectionFormOpen}
        onClose={handleCloseCollectionForm}
        collectionToEdit={collectionToEdit}
      />

      {isSnippetFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <button
              onClick={handleCloseSnippetForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {snippetToEdit ? "Edit Snippet" : "Create New Snippet"}
            </h2>
            <SnippetForm
              snippetToEdit={snippetToEdit}
              onClose={handleCloseSnippetForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
