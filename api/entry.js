// Este archivo es el punto de entrada para Vercel
import { handler as ssrHandler } from '../dist/server/entry.mjs';

// Crear función middleware para Vercel
export default async function handler(req, res) {
  // Configurar el entorno para que el handler de Astro funcione correctamente
  if (!globalThis.process.env.VERCEL) {
    globalThis.process.env.VERCEL = '1';
  }

  // Pasar la solicitud al handler SSR de Astro
  await ssrHandler(req, res);
}

// Asegurar que la ruta se configura como Edge Runtime
export const config = {
  runtime: 'nodejs18.x'
}; 