import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Exact 300 DPI CR80 PVC card standard dimensions (54mm × 85.6mm / 2.125" × 3.375")
export const CARD_EXPORT_WIDTH = 638;
export const CARD_EXPORT_HEIGHT = 1011;
export const CARD_CORNER_RADIUS = 36; // 3.18mm standard CR80 corner radius at 300 DPI

/**
 * Triggers a browser file download from a data URL or blob URL.
 */
export function triggerDownload(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Clips canvas to exact 638×1011 card rounded corners.
 * For PNG: corners remain 100% transparent (no outer white box or square edges).
 * For JPG: corners are filled with clean white.
 * Also strokes a crisp subtle border along the curve for clear boundary definition.
 */
export function clipToCurvedCard(
    sourceCanvas,
    targetW = CARD_EXPORT_WIDTH,
    targetH = CARD_EXPORT_HEIGHT,
    radius = CARD_CORNER_RADIUS,
    isJpg = false
) {
    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetW;
    outCanvas.height = targetH;
    const ctx = outCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (isJpg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
    } else {
        ctx.clearRect(0, 0, targetW, targetH);
    }

    const drawCardPath = (x, y, width, height, r) => {
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, r);
        } else {
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + width, y, x + width, y + height, r);
            ctx.arcTo(x + width, y + height, x, y + height, r);
            ctx.arcTo(x, y + height, x, y, r);
            ctx.arcTo(x, y, x + width, y, r);
            ctx.closePath();
        }
    };

    // 1. Clip and draw card content scaled cleanly to 638x1011 with rounded corners
    ctx.save();
    drawCardPath(0, 0, targetW, targetH, radius);
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
    ctx.restore();

    // 2. Stroke subtle border along the rounded contour so the curve is clearly defined
    const strokeWidth = 2; // ~2px crisp stroke at 638x1011
    const halfStroke = strokeWidth / 2;
    ctx.save();
    drawCardPath(halfStroke, halfStroke, targetW - strokeWidth, targetH - strokeWidth, Math.max(0, radius - halfStroke));
    ctx.strokeStyle = '#e2e8f0'; // Clean crisp subtle outline matching preview border
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.restore();

    return outCanvas;
}

/**
 * Renders a card DOM element using html2canvas with object-fit geometry fixes,
 * then clips to curved CR80 dimensions.
 */
export async function renderCardCanvas(cardElement, scale = 2.5, isJpg = false) {
    if (!cardElement) throw new Error('Card element is not available');

    const rawCanvas = await html2canvas(cardElement, {
        scale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
            const origImg = cardElement.querySelector('.idc__photo-img');
            const clonedImg = clonedDoc.querySelector('.idc__photo-img');
            if (origImg && clonedImg && origImg.naturalWidth && origImg.naturalHeight) {
                const nw = origImg.naturalWidth;
                const nh = origImg.naturalHeight;
                const wrap = origImg.parentElement;
                const cw = wrap ? wrap.offsetWidth : 264;
                const ch = wrap ? wrap.offsetHeight : 247;

                const s = Math.max(cw / nw, ch / nh);
                const rw = nw * s;
                const rh = nh * s;
                const rx = (cw - rw) / 2;
                const ry = 0; // matching 'center top'

                clonedImg.style.position = 'absolute';
                clonedImg.style.left = `${rx}px`;
                clonedImg.style.top = `${ry}px`;
                clonedImg.style.width = `${rw}px`;
                clonedImg.style.height = `${rh}px`;
                clonedImg.style.objectFit = 'fill';
            }
        }
    });

    return clipToCurvedCard(rawCanvas, CARD_EXPORT_WIDTH, CARD_EXPORT_HEIGHT, CARD_CORNER_RADIUS, isJpg);
}

/**
 * Combines Front and Back curved canvases side-by-side with a clean gap.
 */
export function createCombinedCardCanvas(frontCanvas, backCanvas, gap = 36, isJpg = false) {
    const totalW = frontCanvas.width + backCanvas.width + gap;
    const totalH = Math.max(frontCanvas.height, backCanvas.height);

    const compCanvas = document.createElement('canvas');
    compCanvas.width = totalW;
    compCanvas.height = totalH;
    const ctx = compCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (isJpg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalW, totalH);
    } else {
        ctx.clearRect(0, 0, totalW, totalH);
    }

    ctx.drawImage(frontCanvas, 0, 0);
    ctx.drawImage(backCanvas, frontCanvas.width + gap, 0);

    return compCanvas;
}

/**
 * Initializes a jsPDF document.
 * Default is CR80 pair landscape (130mm x 96mm) or standard A4 landscape (297mm x 210mm).
 */
export function createIdCardsPdf(pageSize = 'cr80') {
    const isA4 = pageSize === 'a4';
    return new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: isA4 ? 'a4' : [130, 96],
        compress: true,
    });
}

/**
 * Adds an employee's Front and Back cards to a page in the PDF.
 * @param {jsPDF} pdf
 * @param {HTMLCanvasElement|string} frontCanvas - Front canvas or dataUrl
 * @param {HTMLCanvasElement|string} backCanvas - Back canvas or dataUrl
 * @param {boolean} isFirstPage - If false, addPage is called
 * @param {string} [pageSize='cr80']
 */
export function addEmployeeToPdf(pdf, frontCanvas, backCanvas, isFirstPage = false, pageSize = 'cr80') {
    const isA4 = pageSize === 'a4';
    const pageW = isA4 ? 297 : 130;
    const pageH = isA4 ? 210 : 96;

    if (!isFirstPage) {
        pdf.addPage(isA4 ? 'a4' : [130, 96], 'landscape');
    }

    const frontDataUrl = typeof frontCanvas === 'string' ? frontCanvas : frontCanvas.toDataURL('image/jpeg', 0.96);
    const backDataUrl = typeof backCanvas === 'string' ? backCanvas : backCanvas.toDataURL('image/jpeg', 0.96);

    const cardW = 54; // mm (CR80 standard)
    const cardH = 85.6; // mm (CR80 standard)
    const gap = 5; // mm

    const totalW = cardW * 2 + gap;
    const startX = (pageW - totalW) / 2;
    const startY = (pageH - cardH) / 2;

    // Draw clean background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, 'F');

    // Add Front card
    pdf.addImage(frontDataUrl, 'JPEG', startX, startY, cardW, cardH, undefined, 'FAST');
    // Add Back card
    pdf.addImage(backDataUrl, 'JPEG', startX + cardW + gap, startY, cardW, cardH, undefined, 'FAST');
}
