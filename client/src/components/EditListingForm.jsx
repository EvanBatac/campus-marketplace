import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema } from "../schemas/listingSchema";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function EditListingForm({ listing }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description ?? "",
      price: Number(listing.price),
      category: listing.category,
      status: listing.status,
    },
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data) => {
      const res = await api(`/api/listings/${listing.id}`, {
        method: "PUT",
        body: {
          ...data,
          price: Number(data.price),
          image_url: listing.image_url ?? undefined,
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({
        queryKey: ["listing", String(listing.id)],
      });
      navigate("/my-listings");
    },
  });
  function onSubmit(data) {
    mutate(data);
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="title">Title</label>
      <input id="title" type="text" {...register("title")} />
      {errors.title && <p role="alert">{errors.title.message}</p>}
      <label htmlFor="description">Description</label>
      <textarea id="description" {...register("description")}></textarea>
      {errors.description && <p role="alert">{errors.description.message}</p>}
      <label htmlFor="price">Price</label>
      <input id="price" type="number" step="0.01" {...register("price")} />
      {errors.price && <p role="alert">{errors.price.message}</p>}
      <label htmlFor="category">Category</label>
      <select id="category" {...register("category")}>
        <option value="">Select Category</option>
        <option value="books">Books</option>
        <option value="electronics">Electronics</option>
        <option value="furniture">Furniture</option>
        <option value="clothing">Clothing</option>
        <option value="other">Other</option>
      </select>
      {errors.category && <p role="alert">{errors.category.message}</p>}
      <label htmlFor="status">Status</label>
      <select id="status" {...register("status")}>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
      </select>
      {errors.status && <p role="alert">{errors.status.message}</p>}
      {isError && <p role="alert">{error.message}</p>}
      <button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
