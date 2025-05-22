import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { getCollaborators } from "../../redux/collaborators-slice";
import { getMySnippets, shareSnippet } from "../../redux/snippet-slice";
import { toast } from "sonner";

interface Collaborator {
  _id: string;
  email: string;
  username: string;
}

interface SelectedCollaborator extends Collaborator {
  permission: "view" | "edit";
}

interface InviteCodersProps {
  snippetId: string;
  onClose: () => void;
}

const InviteCoders: React.FC<InviteCodersProps> = ({ snippetId, onClose }) => {
  const dispatch = useAppDispatch();
  const { collaborators, isLoading } = useAppSelector(
    (state) => state.collaborators
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    SelectedCollaborator[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getCollaborators());
  }, [dispatch]);

  const filteredCollaborators = collaborators?.filter(
    (collaborator) =>
      collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborators((prev) => {
      const exists = prev.find((c) => c._id === collaborator._id);
      return exists
        ? prev.filter((c) => c._id !== collaborator._id)
        : [...prev, { ...collaborator, permission: "view" }];
    });
  };

  const updatePermission = (id: string, permission: "view" | "edit") => {
    setSelectedCollaborators((prev) =>
      prev.map((c) => (c._id === id ? { ...c, permission } : c))
    );
  };

  const getPermission = (id: string) =>
    selectedCollaborators.find((c) => c._id === id)?.permission || "view";

  const isSelected = (id: string) =>
    selectedCollaborators.some((c) => c._id === id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCollaborators.length === 0) {
      toast.error("Please select at least one collaborator.");
      return;
    }

    setIsSubmitting(true);
    const formattedCollaborators = selectedCollaborators.map((c) => ({
      id: c._id,
      permission: c.permission,
    }));

    try {
      const result = await dispatch(
        shareSnippet({ id: snippetId, collaborators: formattedCollaborators })
      ).unwrap();

      toast.success(result.message);
      dispatch(getMySnippets());
      setSelectedCollaborators([]);
      setSearchTerm("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to share snippet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Invite Collaborators</h2>
        <p className="text-blue-100 text-sm mt-1">
          Share your snippet with other coders.
        </p>
      </div>

      <form className="p-6 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Collaborators
          </label>
          <input
            type="text"
            id="search"
            className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-6 text-gray-500">
            Loading collaborators...
          </div>
        ) : filteredCollaborators.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
            {filteredCollaborators.map((collaborator) => (
              <div
                key={collaborator._id}
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition ${
                  isSelected(collaborator._id) ? "bg-blue-50" : ""
                }`}
                onClick={() => toggleCollaborator(collaborator)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                      {collaborator.username.charAt(0).toUpperCase()}
                    </div>
                    {isSelected(collaborator._id) && (
                      <span className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {collaborator.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {collaborator.email}
                    </div>
                  </div>
                </div>
                {isSelected(collaborator._id) && (
                  <select
                    value={getPermission(collaborator._id)}
                    onChange={(e) =>
                      updatePermission(
                        collaborator._id,
                        e.target.value as "view" | "edit"
                      )
                    }
                    className="ml-2 text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="view">View only</option>
                    <option value="edit">Can edit</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md py-6">
            No collaborators found.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Sharing..." : "Share Snippet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteCoders;
