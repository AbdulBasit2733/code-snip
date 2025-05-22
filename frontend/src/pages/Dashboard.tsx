import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import SnippetForm from "../components/snippets/SnippetForm";
import CollectionForm from "../components/collections/CollectionForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import SnippetList from "../components/snippets/SnippetLists";
import CollectionList from "../components/collections/CollectionList";
import { getMySnippets } from "../redux/snippet-slice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchCollections } from "../redux/collection-slice";
import InviteCoders from "../components/snippets/InviteCoders";
const mockSnippets = [
  {
    id: 1,
    title: "React Hook useState",
    language: "JavaScript",
    collection: "React Hooks",
  },
  {
    id: 2,
    title: "Python List Comprehension",
    language: "Python",
    collection: "Python Basics",
  },
  {
    id: 3,
    title: "CSS Flexbox Center",
    language: "CSS",
    collection: "CSS Layouts",
  },
  {
    id: 4,
    title: "SQL JOIN Query",
    language: "SQL",
    collection: "Database Queries",
  },
];

const mockCollections = [
  {
    id: 1,
    name: "React Hooks",
    description: "Common React hooks and patterns",
    snippetCount: 5,
  },
  {
    id: 2,
    name: "Python Basics",
    description: "Basic Python concepts and syntax",
    snippetCount: 8,
  },
  {
    id: 3,
    name: "CSS Layouts",
    description: "Modern CSS layout techniques",
    snippetCount: 3,
  },
  {
    id: 4,
    name: "Database Queries",
    description: "SQL queries and database operations",
    snippetCount: 6,
  },
];
const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("snippets");
  const [isSnippetFormOpen, setIsSnippetFormOpen] = useState(false);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);
  const [editingSnippetId, setEditingSnippetId] = useState(null);
  const {
    isLoading: snippetLoading,
    error: snippetError,
    snippets,
  } = useAppSelector((state) => state.snippets);
  const {
    isLoading: collectionLoading,
    error: collectionError,
    collections,
  } = useAppSelector((state) => state.collections);
  const dispatch = useAppDispatch();

  const handleOpenCreateSnippetForm = () => {
    setEditingSnippetId(null);
    setIsSnippetFormOpen(true);
  };

  const handleOpenEditSnippetForm = (snippetId) => {
    setEditingSnippetId(snippetId);
    setIsSnippetFormOpen(true);
  };

  const handleCloseSnippetForm = () => {
    setIsSnippetFormOpen(false);
    setEditingSnippetId(null);
  };

  const handleDeleteSnippet = (snippetId) => {
    // Add your delete logic here
    console.log("Deleting snippet:", snippetId);
  };

  const onInvite = (snippetId) => {
    // console.log(snippetId);
    setIsInviteFormOpen(true);
    setEditingSnippetId(snippetId)
  };

  useEffect(() => {
    dispatch(getMySnippets());
    dispatch(fetchCollections());
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Dialog open={isSnippetFormOpen} onOpenChange={setIsSnippetFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateSnippetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Snippet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSnippetId ? "Edit Snippet" : "Create New Snippet"}
                </DialogTitle>
              </DialogHeader>
              <SnippetForm
                onClose={handleCloseSnippetForm}
                collections={collections}
                snippetId={editingSnippetId}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isInviteFormOpen} onOpenChange={setIsInviteFormOpen}>
            {/* <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger> */}
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Collaborators</DialogTitle>
              </DialogHeader>
              <InviteCoders snippetId={editingSnippetId} onClose={() => setIsInviteFormOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog
            open={isCollectionFormOpen}
            onOpenChange={setIsCollectionFormOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <CollectionForm
                onClose={() => setIsCollectionFormOpen(false)}
                snippets={snippets}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="snippets" className="mt-6">
          <SnippetList
            snippets={snippets}
            searchTerm={searchTerm.toLowerCase()}
            onOpenEditForm={handleOpenEditSnippetForm}
            onDelete={handleDeleteSnippet}
            onInvite={onInvite}
          />
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <CollectionList collections={collections} searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
