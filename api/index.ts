// Vercel Serverless Function entry point.
// This simply re-exports the Express app defined in server.ts, so all
// routes (/api/license/verify, /api/generate, /api/chat, /api/admin/*)
// run here as one serverless function.
export { default } from '../server';
