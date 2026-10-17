import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description is too long (max 1000 characters)"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.enum(["books", "electronics", "furniture", "clothing", "other"], {
    error: "Please select a category",
  }),
});
export default function NewListing() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listingSchema),
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api("/api/listings", {
        method: "POST",
        body: data,
      });
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      navigate(`/listings/${res.data.id}`);
    },
  });
  function onSubmit(data) {
    mutation.mutate(data);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          placeholder="e.g book"
          {...register("title")}
        />
        {errors.title && <p>{errors.title?.message}</p>}
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register("description")} />
        {errors.description && <p>{errors.description.message}</p>}
        <label htmlFor="price">Price</label>
        <input
          id="price"
          type="number"
          step="0.01"
          placeholder="100.00"
          {...register("price")}
        />
        {errors.price && <p>{errors.price.message}</p>}
        <label htmlFor="category">Category</label>
        <select id="category" {...register("category")}>
          <option value="">Select Category</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>
        {errors.category && <p>{errors.category.message}</p>}
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
