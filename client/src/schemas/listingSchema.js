import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title too long"),
  description: z
    .string()
    .trim()
    .max(1000, "Description is too long (max 1000 characters)")
    .optional(),
  price: z.coerce
    .number()
    .nonnegative("Price cannot be negative")
    .max(99999999.99, "Price is too high"),
  category: z.enum(["books", "electronics", "furniture", "clothing", "other"], {
    error: "Please select a category",
  }),
  status: z.enum(["available", "sold"]).optional(),
  images: z
    .any()
    .optional()
    .refine((files) => !files || files.length <= 4, {
      message: "You can upload up to 4 images",
    }),
});
