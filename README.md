# Whato CRM - Plataforma Omnicanal & Extensión para WhatsApp Web

Plataforma CRM de ventas omnicanal multiagente que integra gestión de clientes en tableros Kanban, automatizaciones con IA (Google Gemini 3.6 Flash), agendamiento en Google Calendar y envíos de campañas masivas de difusión.

Para ver el contexto detallado y la arquitectura técnica completa del proyecto, consulta el archivo [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).

## Requisitos y Configuración

1. Clona o descarga el proyecto.
2. Copia `.env.example` a `.env` y configura la variable `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```
3. Ejecuta los comandos:
   ```bash
   npm install
   npm run dev
   ```
4. Abre la aplicación en `http://localhost:3000`.

## Scripts Disponibles

- `npm run dev`: Inicia el servidor Node/Express con Vite middleware en puerto 3000.
- `npm run build`: Compila la SPA con Vite y empaqueta `server.ts` a CommonJS (`dist/server.cjs`) usando esbuild.
- `npm run start`: Ejecuta el servidor en producción (`node dist/server.cjs`).
- `npm run lint`: Valida los tipos TypeScript.
