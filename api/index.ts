// Vercel Serverless Function entry point.
// This re-exports the Express app defined in api/_app.ts (colocated in
// this same folder so Vercel's function bundler reliably includes it),
// so all routes (/api/license/verify, /api/generate, /api/chat,
// /api/admin/*) run here as one serverless function.
export { default } from './_app.js';
