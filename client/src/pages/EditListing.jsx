import EditListingForm from "../components/EditListingForm";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

export default function EditListing() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await api(`/api/listings/${id}`);
      return res;
    },
  });
  if (isLoading) return <p role="status">Loading...</p>;
  if (isError) return <p role="alert">{error.message}</p>;

  const listing = data?.data;
  return (
    <>
      <EditListingForm listing={listing} />
    </>
  );
}
