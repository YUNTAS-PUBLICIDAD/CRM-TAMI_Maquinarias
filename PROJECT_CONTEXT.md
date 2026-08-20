# Contexto General del Proyecto: XIO CRM

## 1. Visión General
**XIO CRM** es una plataforma omnicanal de gestión de relaciones con clientes (CRM) y ventas diseñada específicamente para **WhatsApp Web**, Instagram, X (Twitter) y Messenger. Combina un tablero Kanban visual, automatización de flujos de trabajo, integración directa con **Google Calendar** y asistentes de Inteligencia Artificial impulsados por **Google Gemini 3.6 Flash**.

La aplicación proporciona una interfaz fluida para equipos de ventas y gestión interna multiagente, permitiendo calificar leads, automatizar campañas masivas de difusión, generar respuestas inteligentes asistidas por IA y exportar el proyecto completo para despliegue en producción.

---

## 2. Arquitectura y Stack Tecnológico

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React (Iconografía).
- **Backend / Servidor API:** Node.js, Express, TypeScript (transpilado vía `tsx` en desarrollo y `esbuild` para producción CommonJS).
- **Motor de Inteligencia Artificial:** `@google/genai` (SDK Oficial de Google Gen AI) utilizando el modelo `gemini-3.6-flash` en el servidor.
- **Servidor de Desarrollo y Producción:** Escuchando en `0.0.0.0:3000` con integración de Vite en modo middleware para desarrollo y servidor estático SPA para producción.

---

## 3. Módulos Principales de la Aplicación

### 3.1. Inbox WhatsApp & Chat Omnicanal (`/src/components/Inbox/InboxView.tsx`)
- **Gestión Multiagente de Conversaciones:** Filtrado rápido por canal (WhatsApp, Instagram, Twitter/X, Messenger).
- **Interfaz Estilo WhatsApp Web:** Renderizado de hilos de chat con badges de estado, remitentes, marcas de tiempo e indicación de mensajes de bot/agente.
- **Panel de Extensión XIO CRM (Lado Derecho):**
  - Estado del lead y Score de Inteligencia Artificial (0-100).
  - Selector de etapa del embudo de ventas (Prospecto, Cualificado, Negociación, Venta Ganada, Perdido).
  - Sincronización directa de citas en **Google Calendar** (fecha, hora y notificación automatizada al cliente).
  - Gestor dinámico de etiquetas WhatsApp y bloc de notas rápidas del cliente.
- **Acciones Asistidas por IA:**
  - **Respuestas Rápidas Inteligentes (Smart Replies):** Genera 3 opciones contextuales (Amigable, Formal, Cierre) según el historial del chat usando Gemini.
  - **Resumen Ejecutivo IA:** Analiza el hilo completo para extraer intención principal, objeciones y el siguiente paso sugerido.
  - **Notas de Voz Simuladas:** Envío rápido de audios preseteados.

### 3.2. CRM Kanban & Embudo de Clientes (`/src/components/Contacts/ContactsView.tsx`)
- **Tablero Kanban Interactivo:**
  - Columnas por etapa del embudo (*Prospectos Iniciales*, *Cualificados*, *En Negociación*, *Venta Ganada 🎉*, *Perdidos*).
  - Cálculo automático del valor total del Pipeline y ventas cerradas ganadas en USD.
  - Cambio rápido de etapa mediante menú desplegable o acceso directo a WhatsApp.
- **Vista de Tabla Alternativa:** Presentación detallada con ordenamiento, estado de IA, canal de origen y etiquetas.
- **Modal de Creación de Clientes:** Registro inmediato de nuevos leads asignando teléfono, empresa, valor de oportunidad y tags.

### 3.3. Segmentos de Leads (`/src/components/Segments/SegmentsView.tsx`)
- Creación de audiencias con criterios avanzados (etiquetas, score de IA mínimo, canal y etapa del embudo).
- Conexión directa para iniciar campañas masivas de difusión filtradas por segmento.

### 3.4. Difusión Masiva & Asistente IA de Copywriting (`/src/components/Campaigns/CampaignsView.tsx`)
- Creación y programación de campañas de marketing masivo.
- **Generador de Copy Publicitario con Gemini:** Crea 3 variaciones ajustadas según el tono de voz y el canal destino (hashtags recomendados, emojis y llamadas a la acción CTA).
- Estadísticas de entrega, tasa de apertura, clics y conversiones.

### 3.5. Flujos & Automatizaciones (`/src/components/Automation/AutomationView.tsx`)
- Motor de reglas activadas por disparadores (Trigger: palabras clave, etiquetas añadidas, inactividad, cambio de etapa).
- Simulador de ejecución de reglas para validar respuestas automáticas y asignación de asesores en tiempo real.

### 3.6. API REST, Webhooks & Exportación (`/src/components/ApiGithub/ApiGithubView.tsx`)
- Gestor de claves API REST de la plataforma.
- Configuración de Webhook de salida con simulación de entrega de eventos en tiempo real y registro de logs de auditoría (Payloads JSON, código HTTP y latencia en ms).

### 3.7. Analítica & Reportes (`/src/components/Analytics/AnalyticsView.tsx`)
- Cuadro de mando con gráficos de rendimiento, distribución de prospectos por canal, tiempos medios de respuesta y tasa de conversión del equipo.

---

## 4. Modales y Diálogos de Gestión

### Modal de Exportación a GitHub (`/src/components/GithubModal.tsx`)
- Proporciona las instrucciones completas de comandos Git (`git init`, `git remote add`, `git push`), estructura de archivos y guía para publicar el repositorio en GitHub o desplegarlo en contenedores de Cloud Run.

---

## 5. Endpoints de la API Backend (`server.ts`)

Todas las llamadas a la API de Inteligencia Artificial se ejecutan **exclusivamente del lado del servidor** para proteger la clave `GEMINI_API_KEY`.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verificación de estado del servidor y presencia de la clave de Gemini. |
| `POST` | `/api/ai/smart-reply` | Analiza el historial de chat y devuelve 3 respuestas inteligentes + análisis de sentimiento. |
| `POST` | `/api/ai/campaign-copy` | Genera copys persuasivos adaptados al canal destino usando Gemini. |
| `POST` | `/api/ai/summarize` | Devuelve un resumen ejecutivo de la conversación, intención y acción recomendada. |
| `POST` | `/api/ai/chatbot-autorespond` | Simula un bot de respuesta automática instantánea para mensajes de leads entrantes. |
| `POST` | `/api/webhooks/test` | Simula la entrega de un evento webhook a un endpoint externo. |

---

## 6. Modelos de Datos Principales (`/src/types.ts`)

- `Contact`: Representa a un cliente/lead (nombre, teléfono, avatar, canal, etapa, valor de oferta, score de IA, etiquetas, notas).
- `Conversation`: Estado de un hilo de chat (último mensaje, fecha, mensajes no leídos, canal, agente asignado).
- `Message`: Mensaje individual (remitente agente/bot/contacto, texto, marca de tiempo, indicador de IA).
- `Segment`: Definición de grupo objetivo para campañas.
- `Campaign`: Configuración de difusión masiva y sus métricas asociadas.
- `AutomationRule`: Regla de automatización (disparador, acción, estado activo/inactivo).
- `WebhookLog`: Registro de auditoría de llamadas webhook.

---

## 7. Configuración de Entorno

El archivo `.env.example` contiene las variables requeridas:
```env
# Clave privada de Gemini API (Solo uso en servidor / server-side)
GEMINI_API_KEY=
