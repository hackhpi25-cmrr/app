/**
 * Simple JWT decoder utility
 * This is a basic implementation - in a production app, use a proper JWT library
 */

interface JwtPayload {
  exp?: number;
  iat?: number;
  user_id?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Base64 decoder compatible with React Native
 * Replacement for atob() which is not available in React Native
 */
function base64Decode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  
  str = String(str).replace(/=+$/, '');
  
  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  
  return output;
}

/**
 * Decodes a JWT token and returns the payload
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function jwtDecode(token: string): JwtPayload | null {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64Url decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the base64 string using our custom function
    let jsonPayload;
    try {
      // Use our custom base64 decoder instead of atob
      const decodedBase64 = base64Decode(base64);
      jsonPayload = decodeURIComponent(
        decodedBase64
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      // Fallback to a simpler method if the complex one fails
      const decodedData = base64Decode(base64);
      jsonPayload = decodedData;
    }

    // Parse the JSON payload
    return JSON.parse(jsonPayload);
  } catch (error) {
    // Return null silently instead of logging the error
    return null;
  }
}

/**
 * Checks if a JWT token has expired
 * @param token JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = jwtDecode(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    const expirationTime = payload.exp * 1000; // Convert seconds to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
} 