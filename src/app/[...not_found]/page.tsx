import { notFound } from "next/navigation";

/**
 * This is a catch-all route handler that will capture any undefined routes
 * and properly redirect them to the Next.js not-found handler.
 * 
 * This fixes an issue with 404 handling in Next.js when deployed to Vercel.
 */
export default function NotFoundCatchAll() {
  notFound();
} 