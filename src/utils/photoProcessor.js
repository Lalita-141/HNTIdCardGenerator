import { removeBackground } from '@imgly/background-removal';

// Cache processed transparent images in memory for instant re-use
const cache = new Map();

/**
 * Loads an image URL/data URL into an HTMLImageElement.
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
        img.src = src;
    });
}

/**
 * Converts a Blob to a base64 Data URL.
 */
function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Refines the cutout edges to eliminate white halo / matte fringe (like professional tools):
 * 1. 1px Alpha erosion to trim background fringe.
 * 2. Color despill / inpainting from opaque foreground neighbors so edge pixels
 *    take the true color of hair/skin/clothing rather than background white.
 * 3. Smooth mathematical un-premultiplication for any remaining semi-transparent fringe.
 */
function refineCutoutEdges(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Extract alpha channel
    const alphaSrc = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
        alphaSrc[i] = data[i * 4 + 3];
    }

    // Step 1: 1px Alpha erosion (matte shrink to cut off white halo)
    const erodedAlpha = new Uint8Array(w * h);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const a = alphaSrc[idx];
            if (a === 0) {
                erodedAlpha[idx] = 0;
                continue;
            }
            let minA = a;
            const up = alphaSrc[(y - 1) * w + x];
            const down = alphaSrc[(y + 1) * w + x];
            const left = alphaSrc[y * w + (x - 1)];
            const right = alphaSrc[y * w + (x + 1)];
            if (up < minA) minA = up;
            if (down < minA) minA = down;
            if (left < minA) minA = left;
            if (right < minA) minA = right;
            erodedAlpha[idx] = minA;
        }
    }

    // Step 2: Color inpainting / despill (sample inward genuine foreground color for edges)
    for (let y = 2; y < h - 2; y++) {
        for (let x = 2; x < w - 2; x++) {
            const pIdx = (y * w + x) * 4;
            const a = erodedAlpha[y * w + x];

            if (a > 12 && a < 250) {
                let sumR = 0, sumG = 0, sumB = 0, count = 0;
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * w + (x + dx)) * 4;
                        const nA = alphaSrc[(y + dy) * w + (x + dx)];
                        if (nA > 230) {
                            sumR += data[nIdx];
                            sumG += data[nIdx + 1];
                            sumB += data[nIdx + 2];
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    data[pIdx] = Math.round(sumR / count);
                    data[pIdx + 1] = Math.round(sumG / count);
                    data[pIdx + 2] = Math.round(sumB / count);
                } else {
                    const normA = a / 255;
                    data[pIdx] = Math.max(0, Math.min(255, (data[pIdx] - 255 * (1 - normA) * 0.9) / normA));
                    data[pIdx + 1] = Math.max(0, Math.min(255, (data[pIdx + 1] - 255 * (1 - normA) * 0.9) / normA));
                    data[pIdx + 2] = Math.max(0, Math.min(255, (data[pIdx + 2] - 255 * (1 - normA) * 0.9) / normA));
                }

                data[pIdx + 3] = a;
            } else if (a <= 12) {
                data[pIdx + 3] = 0;
            } else {
                data[pIdx + 3] = a;
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

/**
 * Removes background from an image and applies natural edge finishing
 * (color despill, matte defringing, alpha erosion) so the subject blends
 * seamlessly without white halos, like professional background removal websites.
 *
 * @param {string} imageSrc - URL, data URL, or base64 of the original photo
 * @param {function} [onProgress] - Optional progress callback
 * @returns {Promise<string>} - Transparent PNG data URL ready for the ID card
 */
export async function removeBgAndFramePassport(imageSrc, onProgress = null) {
    if (!imageSrc || typeof imageSrc !== 'string') return null;

    const trimmed = imageSrc.trim();
    if (!trimmed) return null;

    const cacheKey = trimmed.slice(0, 200) + '_' + trimmed.length;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        onProgress?.('Loading photo...');
        // Ensure image is loaded and converted to Data URL so relative URLs never fail on staticimgly.com
        let inputDataUrl = trimmed;
        if (!trimmed.startsWith('data:image/')) {
            const tempImg = await loadImage(trimmed);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = tempImg.naturalWidth;
            tempCanvas.height = tempImg.naturalHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(tempImg, 0, 0);
            inputDataUrl = tempCanvas.toDataURL('image/png');
        }

        onProgress?.('Removing background...');

        // 1. Remove background directly on the full original image (clean cutout)
        const blob = await removeBackground(inputDataUrl, {
            model: 'small',
            progress: (key, current, total) => {
                if (total > 0) {
                    const pct = Math.min(100, Math.round((current / total) * 100));
                    onProgress?.(`Removing background (${pct}%)...`);
                }
            },
        });

        const transparentDataUrl = await blobToDataUrl(blob);

        // 2. Load the transparent cutout
        onProgress?.('Refining natural edges...');
        const rawCutoutImg = await loadImage(transparentDataUrl);

        // 3. Apply professional natural edge finishing (defringing & despill)
        const refinedCanvas = refineCutoutEdges(rawCutoutImg);

        // 4. Frame it passport-style on high-resolution canvas (750px × 660px = 3x of 250px × 220px)
        onProgress?.('Framing passport photo...');
        const targetW = 750;
        const targetH = 660;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Scale so the subject fills the frame prominently (passport portrait framing)
        const scale = Math.max(targetW / refinedCanvas.width, targetH / refinedCanvas.height);
        const drawW = refinedCanvas.width * scale;
        const drawH = refinedCanvas.height * scale;

        // Horizontally centered, aligned towards top so face & hair are prominent with comfortable headroom
        const drawX = (targetW - drawW) / 2;
        const drawY = 0;

        ctx.drawImage(refinedCanvas, drawX, drawY, drawW, drawH);

        const finalDataUrl = canvas.toDataURL('image/png');

        // Store in cache
        cache.set(cacheKey, finalDataUrl);
        return finalDataUrl;
    } catch (err) {
        console.error('Background removal failed, using original photo fallback:', err);
        return trimmed;
    }
}
