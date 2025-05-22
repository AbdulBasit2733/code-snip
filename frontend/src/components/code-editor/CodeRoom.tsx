import React from "react";
import { useParams } from "react-router-dom";

const CodeRoom = () => {
  const params = useParams();
  const { snippetId } = params;
  console.log(snippetId);
  
  return <div>CodeRoom</div>;
};

export default CodeRoom;
