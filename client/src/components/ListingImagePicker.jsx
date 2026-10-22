import { useEffect, useRef, useState } from "react";
import Button from "./ui/Button";

const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

function Preview({ file }) {
  const imageRef = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    imageRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <img
      ref={imageRef}
      alt={file.name}
      className="h-32 w-full bg-slate-100 object-cover"
    />
  );
}

export default function ListingImagePicker({
  value = [],
  onChange,
  disabled,
  error,
}) {
  const [selectionError, setSelectionError] = useState("");
  function addImages(event) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (
      selected.some(
        (file) =>
          !["image/jpeg", "image/png"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setSelectionError("Choose JPG or PNG images, up to 5 MB each.");
      return;
    }
    const unique = new Map(value.map((file) => [fileKey(file), file]));
    selected.forEach((file) => unique.set(fileKey(file), file));
    if (unique.size > 4) {
      setSelectionError(
        "You can upload up to 4 images. Remove an image to add another.",
      );
      return;
    }
    setSelectionError("");
    onChange([...unique.values()]);
  }
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="mb-2 text-sm font-medium text-slate-700">
        Images (up to 4)
      </legend>
      <label htmlFor="images" className="block text-sm text-slate-600">
        Add photos
      </label>
      <input
        id="images"
        type="file"
        multiple
        accept="image/jpeg,image/png"
        onChange={addImages}
        aria-invalid={Boolean(error || selectionError)}
        aria-describedby="images-help images-error"
        className="block w-full rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-semibold file:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      />
      <p id="images-help" className="text-xs leading-5 text-slate-500">
        JPG or PNG, max 5 MB each. The cover photo appears in marketplace
        listings.
      </p>
      <p
        id="images-error"
        role={error || selectionError ? "alert" : undefined}
        className="text-sm text-red-600"
      >
        {selectionError || error?.message}
      </p>
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((file, index) => (
            <li
              key={fileKey(file)}
              className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <Preview file={file} />
              <div className="space-y-2 p-2">
                <p
                  title={file.name}
                  className="truncate text-xs text-slate-500"
                >
                  {file.name}
                </p>
                {index === 0 ? (
                  <p className="flex min-h-11 items-center text-xs font-semibold text-blue-600">
                    Cover photo
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onChange([
                        file,
                        ...value.filter((_, position) => position !== index),
                      ])
                    }
                    className="min-h-11 text-xs font-semibold text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    Make cover
                  </button>
                )}
                <Button
                  variant="secondary"
                  className="w-full px-2 py-2 text-xs"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => {
                    onChange(value.filter((_, position) => position !== index));
                    setSelectionError("");
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
