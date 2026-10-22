import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ListingImagePicker from "../components/ListingImagePicker";
import { useToast } from "../hooks/useToast";
import { listingSchema } from "../schemas/listingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
export default function NewListing() {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    register,
    control,
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
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
    onSuccess: (res) => {
      toast.success("Listing created successfully.");
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
            <Input
              type="text"
              id="title"
              placeholder="e.g book"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
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
            <Input
              as="textarea"
              rows={5}
              id="description"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
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
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="100.00"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "price-error" : undefined}
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
            <Input
              as="select"
              id="category"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "category-error" : undefined}
              {...register("category")}
            >
              <option value="">Select Category</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </Input>
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

          <Controller
            name="images"
            control={control}
            defaultValue={[]}
            render={({ field, fieldState }) => (
              <ListingImagePicker
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
                error={fieldState.error}
              />
            )}
          />
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Listing"}
          </Button>
        </form>
      </section>
    </main>
  );
}
