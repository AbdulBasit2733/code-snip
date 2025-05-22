import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import {
  deleteSnippet,
  getMySnippets,
  leaveSnippet,
} from "../../redux/snippet-slice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { toast } from "sonner";

const SnippetCard = ({ snippet, onOpenEditForm, onInvite }) => {
  const navigate = useNavigate();
  const isLive = snippet?.liveSession?.isLive;
  const activeUsersCount = snippet?.liveSession?.activeUsers?.length || 0;
  // console.log(snippet);
  const AllCollaborators = snippet?.collaborators || [];
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleOnDelete = (id: string) => {
    dispatch(deleteSnippet(id));
  };

  const handleOnLeave = (id: string) => {
    // console.log(id);

    dispatch(leaveSnippet(id)).then((data) => {
      // console.log("Snippet Leave", data);

      if (data.payload.success) {
        toast.success(data.payload.message);
        dispatch(getMySnippets());
      } else {
        toast.error(data.payload.message);
      }
    });
  };

  return (
    <Card key={snippet._id}>
      <CardHeader>
        <CardTitle className="text-lg">{snippet.title}</CardTitle>
        <CardDescription className="flex flex-col gap-y-1">
          <span>
            <Badge variant="outline" className="mr-2">
              {snippet.language}
            </Badge>
            Collection: {snippet.collection?.name}
          </span>
          <div className="mt-2 flex gap-x-2 items-center">
            {isLive ? (
              <Badge className="bg-green-600 text-white w-fit">
                Live Session · {activeUsersCount} active user
                {activeUsersCount !== 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge className="bg-red-300 text-black w-fit">Not Live</Badge>
            )}
            {AllCollaborators && AllCollaborators.length > 0 ? (
              <Badge className="bg-gray-200 text-black rounded-full">
                Collaborators {AllCollaborators.length}
              </Badge>
            ) : (
              <Badge className="bg-gray-200 text-black rounded-full">
                Collaborators {AllCollaborators.length}
              </Badge>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 items-center">
        {snippet && snippet.authorId !== user?._id ? (
          <>
            <Button
              variant="destructive"
              onClick={() => handleOnLeave(snippet._id)}
            >
              Leave
            </Button>
            <Button
              variant="outline"
              className="bg-sky-200"
              onClick={() => onInvite(snippet._id)}
            >
              Invite
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="destructive"
              onClick={() => handleOnDelete(snippet._id)}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              className="bg-amber-100"
              onClick={() => onOpenEditForm(snippet._id)}
            >
              Edit Details
            </Button>
          </>
        )}
        <Button
          variant="outline"
          onClick={() => navigate(`/code-editor/${snippet._id}`)}
        >
          Open In CodeEditor
        </Button>
      </CardContent>
    </Card>
  );
};

export default SnippetCard;
