import React from "react";
import CollectionCard from "./CollectionCard";

const CollectionList = ({ collections, searchTerm }) => {
  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filteredCollections.map((collection) => (
        <CollectionCard collection={collection} />
      ))}
      {filteredCollections.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No collections found matching your search.
        </div>
      )}
    </div>
  );
};

export default CollectionList;
