export type UploadedImageDimensions = { width: number; height: number };

/** Only classify containers we can prove are still images. Never decode frames into an upload. */
export function isStaticImage(buffer: ArrayBuffer, mime: string): boolean {
  const bytes = new Uint8Array(buffer), view = new DataView(buffer);
  const fourCC = (offset: number) => String.fromCharCode(...bytes.subarray(offset, offset + 4));
  if (mime === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') {
    if (bytes.length < 20 || ![137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return false;
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const length = view.getUint32(offset), kind = fourCC(offset + 4);
      if (offset + length + 12 > bytes.length) return false;
      if (kind === 'acTL') return false;
      if (kind === 'IEND') return true;
      offset += length + 12;
    }
    return false;
  }
  if (mime === 'image/webp') {
    if (bytes.length < 20 || fourCC(0) !== 'RIFF' || fourCC(8) !== 'WEBP' || view.getUint32(4,true) + 8 !== bytes.length) return false;
    let image = false;
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const length = view.getUint32(offset + 4,true), kind = fourCC(offset);
      if (offset + length + 8 > bytes.length) return false;
      if (kind === 'ANIM' || kind === 'ANMF' || (kind === 'VP8X' && length >= 1 && (bytes[offset + 8] & 2))) return false;
      if (kind === 'VP8 ' || kind === 'VP8L') image = true;
      offset += 8 + length + (length % 2);
      if (offset === bytes.length) return image;
    }
    return false;
  }
  if (mime === 'image/avif') {
    if (bytes.length < 16 || fourCC(4) !== 'ftyp') return false;
    const size = view.getUint32(0);
    if (size < 16 || size > bytes.length || size % 4) return false;
    const brands = [fourCC(8)];
    for (let offset = 16; offset < size; offset += 4) brands.push(fourCC(offset));
    return brands.includes('avif') && !brands.includes('avis') && !brands.includes('msf1');
  }
  return false;
}

/** Decode the local File with EXIF orientation; never resize/re-encode the uploaded bytes. */
export async function readUploadImageDimensions(file: File): Promise<UploadedImageDimensions | undefined> {
  if (file.size < 1 || file.size > 10_000_000) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!isStaticImage(await file.arrayBuffer(), file.type) || typeof createImageBitmap !== 'function') return;
    const decoded = createImageBitmap(file, {imageOrientation:'from-image'}).then(bitmap => {
      try {
        const {width,height} = bitmap;
        return Number.isInteger(width) && width > 0 && width <= 20000 && Number.isInteger(height) && height > 0 && height <= 20000 ? {width,height} : undefined;
      } finally { bitmap.close(); }
    });
    return await Promise.race([decoded, new Promise<undefined>(resolve => { timer = setTimeout(() => resolve(undefined), 10000); })]);
  } catch { return; } // Unsupported/corrupt files retain conservative delivery.
  finally { clearTimeout(timer); }
}
