import { useToast } from "../hooks/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema } from "../schemas/listingSchema";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function EditListingForm({ listing }) {
  const toast = useToast();
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
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
    onSuccess: () => {
      toast.success("Listing updated successfully.");
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
  const fieldClass = (name) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${errors[name] ? "border-red-400" : "border-slate-300"}`;
  const labelClass = "mb-2 block text-sm font-medium text-slate-700";

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-12">
      <section aria-labelledby="edit-listing-heading" className="mx-auto max-w-2xl">
        <Link to="/my-listings" className="mb-6 inline-flex items-center gap-2 rounded-sm text-sm font-medium text-slate-500 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"><span aria-hidden="true">←</span> Back to my listings</Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <header className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">Keep it current</p>
            <h1 id="edit-listing-heading" className="text-3xl font-bold tracking-tight text-slate-900">Edit listing</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Update your item details or mark it as sold.</p>
          </header>
          {listing.image_url && <img src={listing.image_url} alt={listing.title} className="mb-8 h-48 w-full rounded-xl bg-slate-100 object-contain" />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
      <label htmlFor="title" className={labelClass}>Title</label>
      <input id="title" className={fieldClass("title")} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} type="text" {...register("title")} />
      {errors.title && <p id="title-error" role="alert" className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <div>
      <label htmlFor="description" className={labelClass}>Description</label>
      <textarea rows={5} id="description" className={fieldClass("description")} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} {...register("description")}></textarea>
      {errors.description && <p id="description-error" role="alert" className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
      </div>
      <div>
      <label htmlFor="price" className={labelClass}>Price</label>
      <input id="price" className={fieldClass("price")} aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? "price-error" : undefined} type="number" step="0.01" {...register("price")} />
      {errors.price && <p id="price-error" role="alert" className="mt-2 text-sm text-red-600">{errors.price.message}</p>}
      </div>
      <div>
      <label htmlFor="category" className={labelClass}>Category</label>
      <select id="category" className={fieldClass("category")} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "category-error" : undefined} {...register("category")}>
        <option value="">Select Category</option>
        <option value="books">Books</option>
        <option value="electronics">Electronics</option>
        <option value="furniture">Furniture</option>
        <option value="clothing">Clothing</option>
        <option value="other">Other</option>
      </select>
      {errors.category && <p id="category-error" role="alert" className="mt-2 text-sm text-red-600">{errors.category.message}</p>}
      </div>
      <div>
      <label htmlFor="status" className={labelClass}>Status</label>
      <select id="status" className={fieldClass("status")} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? "status-error" : undefined} {...register("status")}>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
      </select>
      {errors.status && <p id="status-error" role="alert" className="mt-2 text-sm text-red-600">{errors.status.message}</p>}
      </div>
      {isError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
      <Link to="/my-listings" className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Cancel</Link>
      <button disabled={isPending} type="submit" className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Saving..." : "Save changes"}
      </button>
      </div>
    </form>
        </div>
      </section>
    </main>
  );
}
