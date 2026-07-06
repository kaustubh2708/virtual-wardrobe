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

/**
 * Like removeBg, but works on remote store/CDN images that block cross-origin
 * fetches: on a direct-fetch failure it retries through images.weserv.nl, a
 * free image proxy that serves any public image with CORS headers. Only ever
 * used for already-public product URLs, so nothing private transits the proxy.
 * @param {string} imageSrc  A data URL or any https image URL.
 * @returns {Promise<Blob>}  PNG blob with a transparent background.
 */
export async function removeBgSmart(imageSrc) {
  try {
    return await removeBg(imageSrc);
  } catch (err) {
    if (imageSrc.startsWith('data:')) throw err; // nothing a proxy can fix
    // Two independent proxies: some stores block one fetcher but not the other.
    // (A few, like Uniqlo, block all datacenter traffic — those need a re-shoot.)
    try {
      return await removeBg(`https://images.weserv.nl/?url=${encodeURIComponent(imageSrc.replace(/^https?:\/\//, ''))}`);
    } catch {
      return removeBg(`https://api.allorigins.win/raw?url=${encodeURIComponent(imageSrc)}`);
    }
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
