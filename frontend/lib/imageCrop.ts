export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const createImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for cropping"));
    image.src = src;
  });
};

export const cropImageToFile = async (
  imageSrc: string,
  crop: PixelCrop,
  fileName: string,
  fileType = "image/jpeg"
): Promise<{ file: File; previewUrl: string }> => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to crop image on this browser");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error("Failed to generate cropped image"));
      },
      fileType,
      0.92
    );
  });

  const hasPngType = fileType.includes("png");
  const hasWebpType = fileType.includes("webp");
  const extension = hasPngType ? "png" : hasWebpType ? "webp" : "jpg";
  const safeName = fileName.replace(/\.[^/.]+$/, "") || "community-image";

  const file = new File([blob], `${safeName}-cropped.${extension}`, {
    type: fileType,
  });

  return {
    file,
    previewUrl: URL.createObjectURL(blob),
  };
};
