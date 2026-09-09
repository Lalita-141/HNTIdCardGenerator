/**
 * Normalizes an employee photo string to a valid data URL.
 * Handles:
 * - Already formed data URLs (`data:image/...`), blob URLs, http(s) URLs
 * - Single base64 strings (PNG, JPEG, GIF, WEBP)
 * - Double base64-encoded strings (e.g. backend re-encoding base64 text)
 */
export function formatProfileImage(raw) {
    if (!raw || typeof raw !== 'string') return null;
    let s = raw.trim();
    if (!s) return null;

    if (
        s.startsWith('data:image/') ||
        s.startsWith('blob:') ||
        s.startsWith('http://') ||
        s.startsWith('https://')
    ) {
        return s;
    }

    // Check if the string was double base64-encoded
    try {
        const sample = atob(s.slice(0, 120));
        if (
            sample.startsWith('data:image/') ||
            sample.startsWith('iVBORw') ||
            sample.startsWith('/9j/') ||
            sample.startsWith('R0lGOD') ||
            sample.startsWith('UklGR')
        ) {
            s = atob(s).trim();
            if (s.startsWith('data:image/')) {
                return s;
            }
        }
    } catch (e) {
        // Fallback to direct handling if atob fails
    }

    // Detect MIME type from header signature
    let mime = 'image/png';
    if (s.startsWith('/9j/')) {
        mime = 'image/jpeg';
    } else if (s.startsWith('iVBORw')) {
        mime = 'image/png';
    } else if (s.startsWith('R0lGOD')) {
        mime = 'image/gif';
    } else if (s.startsWith('UklGR')) {
        mime = 'image/webp';
    }

    return `data:${mime};base64,${s}`;
}
