import { z } from "zod";

export const listingSchema = z.object({
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
  status: z.enum(["available", "sold"]).optional(),
  images: z.any().refine((files) => !files || files.length <= 4, {
    message: "You can upload up to 4 images",
  }),
});
