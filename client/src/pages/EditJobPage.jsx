import PostJobPage from "./PostJobPage";

// EditJobPage is just a wrapper around PostJobPage
// PostJobPage already handles both create and edit modes based on the URL params
export default function EditJobPage() {
  return <PostJobPage />;
}
