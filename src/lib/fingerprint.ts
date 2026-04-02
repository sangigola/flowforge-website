// Browser fingerprint utility for user identification
// Generates a consistent session ID based on browser characteristics

/**
 * Generates a unique session ID based on browser characteristics.
 * This creates a stable identifier that persists across page refreshes
 * but is unique to each browser/device combination.
 */
export async function generateSessionId(): Promise<string> {
  // Collect browser characteristics
  const components: string[] = [];

  // User agent string
  if (typeof navigator !== 'undefined') {
    components.push(navigator.userAgent || '');
    components.push(navigator.language || '');
    components.push(String(navigator.hardwareConcurrency || ''));
    components.push(navigator.platform || '');
  }

  // Screen properties
  if (typeof screen !== 'undefined') {
    components.push(`${screen.width}x${screen.height}`);
    components.push(String(screen.colorDepth || ''));
    components.push(`${screen.availWidth}x${screen.availHeight}`);
  }

  // Timezone
  if (typeof Intl !== 'undefined') {
    try {
      components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch {
      components.push('');
    }
  }
  components.push(String(new Date().getTimezoneOffset()));

  // Canvas fingerprint (optional, adds uniqueness)
  const canvasFingerprint = getCanvasFingerprint();
  if (canvasFingerprint) {
    components.push(canvasFingerprint);
  }

  // WebGL renderer (optional)
  const webglInfo = getWebGLInfo();
  if (webglInfo) {
    components.push(webglInfo);
  }

  // Combine all components and hash
  const combinedString = components.join('|');

  // Use Web Crypto API for hashing
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(combinedString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 32); // Return first 32 chars
    } catch {
      // Fallback to simple hash
      return simpleHash(combinedString);
    }
  }

  // Fallback for environments without crypto.subtle
  return simpleHash(combinedString);
}

/**
 * Gets a canvas fingerprint by rendering text and extracting pixel data
 */
function getCanvasFingerprint(): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw some text with specific styling
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Flowforge', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Session', 4, 17);

    // Get data URL and return a portion of it
    const dataUrl = canvas.toDataURL();
    return dataUrl.slice(-50);
  } catch {
    return null;
  }
}

/**
 * Gets WebGL renderer information
 */
function getWebGLInfo(): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;

    const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer || null;
  } catch {
    return null;
  }
}

/**
 * Simple hash function for fallback
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to positive hex string and pad
  const positiveHash = Math.abs(hash);
  const hex = positiveHash.toString(16);
  // Add timestamp for more uniqueness in fallback
  const timestamp = Date.now().toString(16);
  return (hex + timestamp).substring(0, 32).padEnd(32, '0');
}

/**
 * Gets or creates a session ID, storing it in localStorage
 */
export async function getOrCreateSessionId(): Promise<string> {
  const STORAGE_KEY = 'flowforge_session';

  // Check if we already have a session ID stored
  if (typeof localStorage !== 'undefined') {
    const existingId = localStorage.getItem(STORAGE_KEY);
    if (existingId && existingId.length === 32) {
      return existingId;
    }
  }

  // Generate a new session ID
  const newId = await generateSessionId();

  // Store it for future use
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, newId);
    } catch {
      // localStorage might be full or disabled
    }
  }

  return newId;
}

/**
 * Clears the stored session ID (useful for testing or user logout)
 */
export function clearSessionId(): void {
  const STORAGE_KEY = 'flowforge_session';
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }
}
