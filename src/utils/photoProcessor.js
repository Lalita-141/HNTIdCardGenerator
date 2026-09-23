import { removeBackground } from '@imgly/background-removal';

// Cache processed transparent images in memory for instant re-use
const cache = new Map();
const inFlightJobs = new Map();

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
/**
 * Refines the cutout edges to eliminate white halo / matte fringe and background noise:
 * 1. Suppresses low-confidence background noise and compression artifacts.
 * 2. Connected Component Analysis: isolates the main subject and removes floating
 *    background islands, specks, and white dots.
 * 3. Color defringing / un-premultiplying: eliminates white matte edge halos.
 */
function removeStrayArtifactsAndDefringe(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const totalPixels = w * h;

    // Extract alpha channel & suppress weak background noise (alpha < 35)
    const alpha = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
        const a = data[i * 4 + 3];
        alpha[i] = a < 35 ? 0 : a;
    }

    // Connected Component Analysis: keep primary subject and eliminate stray background dots
    const visited = new Uint8Array(totalPixels);
    const components = [];

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            if (alpha[idx] > 35 && visited[idx] === 0) {
                const queue = new Int32Array(totalPixels);
                let head = 0;
                let tail = 0;

                queue[tail++] = idx;
                visited[idx] = 1;

                while (head < tail) {
                    const curr = queue[head++];
                    const cy = Math.floor(curr / w);
                    const cx = curr % w;

                    if (cx > 0) {
                        const left = curr - 1;
                        if (alpha[left] > 35 && visited[left] === 0) {
                            visited[left] = 1;
                            queue[tail++] = left;
                        }
                    }
                    if (cx < w - 1) {
                        const right = curr + 1;
                        if (alpha[right] > 35 && visited[right] === 0) {
                            visited[right] = 1;
                            queue[tail++] = right;
                        }
                    }
                    if (cy > 0) {
                        const up = curr - w;
                        if (alpha[up] > 35 && visited[up] === 0) {
                            visited[up] = 1;
                            queue[tail++] = up;
                        }
                    }
                    if (cy < h - 1) {
                        const down = curr + w;
                        if (alpha[down] > 35 && visited[down] === 0) {
                            visited[down] = 1;
                            queue[tail++] = down;
                        }
                    }
                }

                components.push({
                    size: tail,
                    queue: queue.subarray(0, tail)
                });
            }
        }
    }

    // Find the largest component (the person)
    components.sort((a, b) => b.size - a.size);
    const mainComp = components[0];

    const keepMask = new Uint8Array(totalPixels);
    if (mainComp && mainComp.size > 0) {
        // Keep the main subject
        for (let i = 0; i < mainComp.size; i++) {
            keepMask[mainComp.queue[i]] = 1;
        }
        // Also keep any connected component >= 5% of main subject (e.g. hands/shoulders slightly detached)
        const minKeepSize = Math.max(500, Math.floor(mainComp.size * 0.05));
        for (let c = 1; c < components.length; c++) {
            if (components[c].size >= minKeepSize) {
                for (let i = 0; i < components[c].size; i++) {
                    keepMask[components[c].queue[i]] = 1;
                }
            }
        }
    }

    // Zero out alpha for any stray pixels not part of the subject
    for (let i = 0; i < totalPixels; i++) {
        if (keepMask[i] === 0) {
            data[i * 4 + 3] = 0;
            alpha[i] = 0;
        } else {
            data[i * 4 + 3] = alpha[i];
        }
    }

    // Defringe edges & un-premultiply white background fringe so edges cleanly blend
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const pIdx = (y * w + x) * 4;
            const a = data[pIdx + 3];

            if (a > 0 && a < 240) {
                const normA = a / 255;
                // Un-premultiply from white background to strip halo
                data[pIdx] = Math.max(0, Math.min(255, Math.round((data[pIdx] - 255 * (1 - normA)) / normA)));
                data[pIdx + 1] = Math.max(0, Math.min(255, Math.round((data[pIdx + 1] - 255 * (1 - normA)) / normA)));
                data[pIdx + 2] = Math.max(0, Math.min(255, Math.round((data[pIdx + 2] - 255 * (1 - normA)) / normA)));
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

/**
 * Removes background from an image and applies natural edge finishing,
 * noise removal, and frames it with the exact solid template green (#c8eec7) background.
 *
 * @param {string} imageSrc - URL, data URL, or base64 of the original photo
 * @param {function} [onProgress] - Optional progress callback
 * @returns {Promise<string>} - Framed photo PNG data URL with template green background
 */
export async function removeBgAndFramePassport(imageSrc, onProgress = null) {
    if (!imageSrc || typeof imageSrc !== 'string') return null;

    const trimmed = imageSrc.trim();
    if (!trimmed) return null;

    const cacheKey = 'v3_transparent_' + trimmed.slice(0, 200) + '_' + trimmed.length;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    if (inFlightJobs.has(cacheKey)) {
        return inFlightJobs.get(cacheKey);
    }

    const job = (async () => {
        try {
            onProgress?.('Loading photo...');
        // Ensure image is loaded and converted to Data URL
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

        // 1. Remove background with high-precision 'medium' model (isnet_fp16)
        const blob = await removeBackground(inputDataUrl, {
            model: 'medium',
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

        // 3. Remove stray background dots/artifacts and defringe edges
        const refinedCanvas = removeStrayArtifactsAndDefringe(rawCutoutImg);

        // 4. Intelligent Passport Framing with Headroom & Subject Detection
        onProgress?.('Framing photo...');

        const rw = refinedCanvas.width;
        const rh = refinedCanvas.height;
        const rctx = refinedCanvas.getContext('2d', { willReadFrequently: true });
        const rImgData = rctx.getImageData(0, 0, rw, rh);
        const rData = rImgData.data;

        // Detect non-transparent subject bounding box
        let minX = rw, maxX = 0, minY = rh, maxY = 0;
        let hasSubject = false;
        for (let y = 0; y < rh; y++) {
            for (let x = 0; x < rw; x++) {
                if (rData[(y * rw + x) * 4 + 3] > 30) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    hasSubject = true;
                }
            }
        }

        if (!hasSubject) {
            minX = 0; maxX = rw; minY = 0; maxY = rh;
        }

        const subjectW = Math.max(1, maxX - minX);
        const subjectCenterX = (minX + maxX) / 2;

        // Standard card photo viewport is 250px × 220px (scale 3x = 750px × 660px)
        const viewW = 750;
        const viewH = 660;

        // Natural passport headroom: top of hair ~6-8% of viewport height (~45px)
        const targetHeadroom = Math.round(viewH * 0.07);

        // Scale calculation:
        // 1. Ensure shoulders span comfortably across the card (~80-86% of viewW)
        const subjectH = Math.max(1, maxY - minY);
        const scaleByWidth = (viewW * 0.84) / subjectW;
        const minScaleToFill = viewW / rw;
        // 2. Ensure clothing/torso extends all the way down to the bottom of the card viewport (viewH)
        const minScaleForHeight = (viewH - targetHeadroom) / subjectH;
        const scale = Math.max(minScaleToFill, Math.max(scaleByWidth, minScaleForHeight));

        const drawW = rw * scale;
        const drawH = rh * scale;

        // Center horizontally on the subject's face/body center
        const drawX = (viewW / 2) - (subjectCenterX * scale);

        // Align top of hair (minY) to targetHeadroom so face is positioned in the upper-middle
        let drawY = targetHeadroom - (minY * scale);

        // Ensure the torso extends to the bottom of the card frame (no empty gap below clothing)
        if (drawY + (maxY * scale) < viewH) {
            drawY = viewH - (maxY * scale);
        }

        // Exact 750px × 660px canvas matching the card photo container 250px × 220px (1:1 aspect ratio)
        const targetW = viewW;
        const targetH = viewH;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Keep canvas transparent so repositioning and zooming don't create mismatched background edges
        ctx.clearRect(0, 0, targetW, targetH);

        // Draw the subject
        ctx.drawImage(refinedCanvas, drawX, drawY, drawW, drawH);

        const finalDataUrl = canvas.toDataURL('image/png');

        // Store in cache
        cache.set(cacheKey, finalDataUrl);
        return finalDataUrl;
    } catch (err) {
        console.error('Background removal failed, using original photo fallback:', err);
        return trimmed;
    } finally {
        inFlightJobs.delete(cacheKey);
    }
    })();

    inFlightJobs.set(cacheKey, job);
    return job;
}
