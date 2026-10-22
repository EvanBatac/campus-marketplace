import { useRef, useState } from "react";
import Button from "./ui/Button";

export default function ListingGallery({ images, title }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef(null);
  const selected = images[selectedIndex] ?? images[0];
  if (!selected)
    return (
      <div className="mb-6 flex h-64 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
        No photos added
      </div>
    );

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => dialogRef.current.showModal()}
        aria-label={`Enlarge photo ${selectedIndex + 1} of ${title}`}
        className="group relative block w-full overflow-hidden rounded-xl bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
      >
        <img
          src={selected.url}
          alt={title}
          className="h-64 w-full object-contain sm:h-96"
        />
        <span className="absolute right-3 bottom-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          Enlarge photo
        </span>
      </button>
      {images.length > 1 && (
        <div
          role="group"
          aria-label="Listing photos"
          className="mt-3 flex flex-wrap gap-3"
        >
          {images.map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              aria-label={`Show photo ${index + 1} of ${title}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className={`overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${selectedIndex === index ? "border-blue-600" : "border-transparent hover:border-slate-300"}`}
            >
              <img
                src={image.url}
                alt=""
                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialogRef}
        aria-label={`Photos of ${title}`}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-5xl rounded-2xl bg-white p-4 shadow-xl backdrop:bg-slate-900/80 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-semibold text-slate-700">
            {title} · {selectedIndex + 1} / {images.length}
          </p>
          <Button variant="secondary" onClick={() => dialogRef.current.close()}>
            Close
          </Button>
        </div>
        <img
          src={selected.url}
          alt={`${title}, photo ${selectedIndex + 1}`}
          className="max-h-[65svh] w-full object-contain"
        />
        {images.length > 1 && (
          <div className="mt-4 flex justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setSelectedIndex(
                  (selectedIndex - 1 + images.length) % images.length,
                )
              }
            >
              ← Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setSelectedIndex((selectedIndex + 1) % images.length)
              }
            >
              Next →
            </Button>
          </div>
        )}
      </dialog>
    </div>
  );
}
