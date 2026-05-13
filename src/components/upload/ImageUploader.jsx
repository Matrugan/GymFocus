import { useRef, useState } from "react";

import {
  ImagePlus,
  X,
  UploadCloud,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

function ImageUploader({
  image,
  setImage,
  label = "Add Image",
  maxSizeMB = 5,
  previewHeight = "max-h-[300px]",
}) {
  const inputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);

  const [compressing, setCompressing] = useState(false);

  async function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setCompressing(true);

    try {
      const compressedImage = await compressImage(file);

      setImage(compressedImage);
    } catch (error) {
      console.log(error);

      toast.error("Error processing image.");
    } finally {
      setCompressing(false);
    }
  }

  function handleInputChange(e) {
    const file = e.target.files[0];

    handleFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();

    setDragActive(false);

    const file = e.dataTransfer.files[0];

    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();

    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();

    setDragActive(false);
  }

  function removeImage() {
    setImage(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();

        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");

          const maxWidth = 1200;

          const scale = Math.min(maxWidth / img.width, 1);

          canvas.width = img.width * scale;

          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed."));
                return;
              }

              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".jpg"),
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );

              resolve(compressedFile);
            },
            "image/jpeg",
            0.78
          );
        };

        img.onerror = () => {
          reject(new Error("Image load error."));
        };
      };

      reader.onerror = () => {
        reject(new Error("File read error."));
      };
    });
  }

  return (
    <div className="w-full">
      {!image && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            w-full
            border-2
            border-dashed
            rounded-2xl
            p-5
            sm:p-6
            cursor-pointer
            transition
            flex
            flex-col
            items-center
            justify-center
            text-center
            min-h-[150px]

            ${
              dragActive
                ? "border-purple-500 bg-purple-500/10"
                : `
                  border-zinc-300
                  bg-zinc-50
                  hover:border-purple-500
                  hover:bg-purple-500/5

                  dark:border-white/10
                  dark:bg-black/30
                `
            }
          `}
        >
          {compressing ? (
            <Loader2
              size={34}
              className="animate-spin text-purple-500 mb-3"
            />
          ) : (
            <UploadCloud
              size={38}
              className="text-purple-500 mb-3"
            />
          )}

          <h3 className="font-bold text-zinc-950 dark:text-white">
            {compressing ? "Processing image..." : label}
          </h3>

          <p className="text-sm text-zinc-500 mt-1">
            Click or drag an image here
          </p>

          <p className="text-xs text-zinc-400 mt-2">
            JPG, PNG or WEBP up to {maxSizeMB}MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {image && (
        <div
          className="
            relative
            mt-4
            rounded-2xl
            overflow-hidden
            border
            border-zinc-200
            bg-zinc-100

            dark:border-white/10
            dark:bg-black/30
          "
        >
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className={`
              w-full
              ${previewHeight}
              object-cover
            `}
          />

          <button
            type="button"
            onClick={removeImage}
            className="
              absolute
              top-3
              right-3
              w-9
              h-9
              rounded-full
              bg-black/70
              text-white
              flex
              items-center
              justify-center
              hover:bg-red-500
              transition
            "
          >
            <X size={18} />
          </button>

          <div
            className="
              absolute
              left-3
              bottom-3
              px-3
              py-2
              rounded-full
              bg-black/70
              text-white
              text-xs
              font-bold
              flex
              items-center
              gap-2
            "
          >
            <ImagePlus size={14} />
            Preview ready
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;