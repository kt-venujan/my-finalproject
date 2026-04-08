"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Loader2 } from "lucide-react";
import { cropImageToFile } from "@/lib/imageCrop";
import "react-easy-crop/react-easy-crop.css";

type ImageCropModalProps = {
  isOpen: boolean;
  imageSrc: string;
  title: string;
  aspect: number;
  fileName: string;
  fileType?: string;
  onCancel: () => void;
  onApply: (file: File, previewUrl: string) => void;
};

export default function ImageCropModal({
  isOpen,
  imageSrc,
  title,
  aspect,
  fileName,
  fileType,
  onCancel,
  onApply,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError("");
  }, [isOpen, imageSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) {
      setError("Please adjust the crop area and try again.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      const { file, previewUrl } = await cropImageToFile(
        imageSrc,
        croppedAreaPixels,
        fileName,
        fileType
      );

      onApply(file, previewUrl);
    } catch {
      setError("Could not crop image. Please try another image.");
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-[#121218] p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/10"
            disabled={busy}
          >
            Close
          </button>
        </div>

        <div className="relative h-[340px] overflow-hidden rounded-xl border border-white/10 bg-black sm:h-[420px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="horizontal-cover"
            showGrid
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs uppercase tracking-[0.16em] text-white/65">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-rose-500"
            disabled={busy}
          />
        </div>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-65"
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
