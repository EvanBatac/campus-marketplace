import { useForm } from "react-hook-form";

export default function EditListingForm({ listing }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: listing.title,
      description: listing.description ?? "",
      price: listing.price,
      category: listing.category,
    },
  });
  function onSubmit(data) {
    console.log(data);
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="title">Title</label>
      <input id="title" type="text" {...register("title")} />
      <label htmlFor="description">Description</label>
      <textarea id="description" {...register("description")}></textarea>
      <label htmlFor="price">Price</label>
      <input id="price" type="number" step="0.01" {...register("price")} />
      <label htmlFor="category">Category</label>
      <select id="category" {...register("category")}>
        <option value="">Select Category</option>
        <option value="books">Books</option>
        <option value="electronics">Electronics</option>
        <option value="furniture">Furniture</option>
        <option value="clothing">Clothing</option>
        <option value="other">Other</option>
      </select>
      <button type="submit">Save</button>
    </form>
  );
}
