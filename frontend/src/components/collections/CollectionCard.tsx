import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { deleteCollection } from "../../redux/collection-slice";
import { useAppDispatch } from "../../hooks/reduxHooks";

const CollectionCard = ({ collection }) => {
  const dispatch = useAppDispatch();
  return (
    <Card key={collection._id}>
      <CardHeader>
        <CardTitle className="text-lg">{collection.name}</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{collection.description}</span>
          <Badge variant="secondary">{collection.snippetCount} snippets</Badge>
        </CardDescription>
        <CardContent>
          <Button
            variant={"destructive"}
            onClick={() => dispatch(deleteCollection(collection._id))}
          >
            Delete
          </Button>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default CollectionCard;
