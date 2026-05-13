// Browser-side image compression using Canvas.
// Resizes to a max dimension and re-encodes as WebP for major savings.

export interface CompressOptions {
  maxDimension?: number; // longest side in px
  quality?: number; // 0..1
  mimeType?: "image/webp" | "image/jpeg";
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<File> {
  const { maxDimension = 1920, quality = 0.82, mimeType = "image/webp" } = opts;

  // Skip compression for GIFs and SVGs (animation/vector)
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  const longest = Math.max(width, height);
  if (longest > maxDimension) {
    const scale = maxDimension / longest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, mimeType, quality)
  );

  if (!blob) return file;

  // If compression didn't help, keep original
  if (blob.size >= file.size) return file;

  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${ext}`, { type: mimeType });
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
