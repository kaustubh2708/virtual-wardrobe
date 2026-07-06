// Client-side background removal via @imgly/background-removal — runs fully in
// the browser (WASM/ONNX), no API key, no server, free. The model (~a few MB)
// is downloaded from a CDN on first use and cached by the browser afterwards,
// so the first cutout is slow and later ones are fast.
//
// The library is imported dynamically so its weight never lands in the main
// bundle — it only loads when the user actually taps "Clean up background".

/**
 * Remove the background from an image.
 * @param {string} imageSrc  A data URL or a (CORS-enabled) https URL.
 * @returns {Promise<Blob>}  PNG blob with a transparent background.
 */
export async function removeBg(imageSrc) {
  const { removeBackground } = await import('@imgly/background-removal');
  return removeBackground(imageSrc, { output: { format: 'image/png' } });
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
