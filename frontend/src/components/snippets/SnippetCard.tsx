import { useNavigate } from "react-router-dom";

const SnippetCard = ({ snippet }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/editor/${snippet._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
    >
      <h2 className="text-lg font-bold">{snippet.title}</h2>
      <p className="text-sm text-gray-600">{snippet.language}</p>
    </div>
  );
};

export default SnippetCard