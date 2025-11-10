import "@testing-library/jest-dom";
import "whatwg-fetch";

// Polyfill for Response.json() which is not available in Node.js environment
if (!Response.prototype.json) {
  Response.prototype.json = async function() {
    const text = await this.text();
    return JSON.parse(text);
  };
}

// Mock NextResponse for testing
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    },
  },
}));
