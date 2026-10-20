import cloudinary from "../config/cloudinary.js";

export async function deleteFromCloudinary(publicId) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}
