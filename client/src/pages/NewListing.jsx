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
  images: z.any(),
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
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (formData) => {
      const res = await api("/api/listings", {
        method: "POST",
        body: formData,
      });
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      navigate(`/listings/${res.data.id}`);
    },
  });
  function onSubmit(data) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("category", data.category);

    for (const file of Array.from(data.images ?? [])) {
      formData.append("images", file);
    }

    mutate(formData);
  }

  return (
    <main className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <section
        aria-labelledby="new-listing-heading"
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10"
      >
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Your campus, connected
          </p>
          <h1
            id="new-listing-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Sell an item
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Share what you’re selling with your campus community.
          </p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="e.g book"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.title ? "border-red-400" : "border-slate-300"}`}
              {...register("title")}
            />
            {errors.title && (
              <p id="title-error" className="mt-2 text-sm text-red-600">
                {errors.title?.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              rows={5}
              id="description"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.description ? "border-red-400" : "border-slate-300"}`}
              {...register("description")}
            />
            {errors.description && (
              <p id="description-error" className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              placeholder="100.00"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "price-error" : undefined}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.price ? "border-red-400" : "border-slate-300"}`}
              {...register("price")}
            />
            {errors.price && (
              <p id="price-error" className="mt-2 text-sm text-red-600">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>
            <select
              id="category"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "category-error" : undefined}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors.category ? "border-red-400" : "border-slate-300"}`}
              {...register("category")}
            >
              <option value="">Select Category</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p id="category-error" className="mt-2 text-sm text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>
          {isError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
            >
              {error.message}
            </p>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            {...register("images")}
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            {isPending ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </section>
    </main>
  );
}
