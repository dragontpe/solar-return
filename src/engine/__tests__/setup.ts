import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Polyfill fetch for file:// URLs so sweph-wasm can load its WASM binary in Node
const originalFetch = globalThis.fetch;
globalThis.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('file://')) {
    const filePath = fileURLToPath(url);
    const buffer = readFileSync(filePath);
    return new Response(buffer, {
      status: 200,
      headers: { 'Content-Type': 'application/wasm' },
    });
  }
  return originalFetch(input, init);
};
