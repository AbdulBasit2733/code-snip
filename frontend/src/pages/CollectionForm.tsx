import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  createCollection,
  fetchCollections,
  updateCollection,
} from "../redux/collection-slice/index";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { toast } from "sonner";

const CollectionForm = ({ isOpen, onClose, collectionToEdit = null }) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.collections.isLoading);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Initialize form with data if editing an existing collection
  useEffect(() => {
    if (collectionToEdit) {
      setFormData({
        name: collectionToEdit?.name || "",
        description: collectionToEdit?.description || "",
      });
    } else {
      // Reset form when creating a new collection
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [collectionToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (collectionToEdit) {
        // Update existing collection
        await dispatch(
          updateCollection({
            id: collectionToEdit._id,
            ...formData,
          })
        ).then((data) => {
          if (data.payload?.success) {
            toast.success(data.payload.message);
            dispatch(fetchCollections())
          } else {
            toast.error(data.payload?.message);
          }
        });
      } else {
        // Create new collection
        await dispatch(createCollection(formData)).then((data) => {
          if (data.payload?.success) {
            toast.success(data.payload.message);
          } else {
            toast.error(data.payload?.message);
          }
        });
      }

      // Close the form and reset
      onClose();
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to save collection:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {collectionToEdit ? "Edit Collection" : "Create New Collection"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Collection Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter collection name"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter collection description (optional)"
              />
            </div>
          </div>

          {/* Footer / Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Saving..."
                : collectionToEdit
                ? "Update Collection"
                : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;
