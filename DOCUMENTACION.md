# Documentación Técnica y Manual Completo: XIO CRM (Whato Inbox)

Sistema Integral de CRM Omnicanal para WhatsApp Web, Instagram, X (Twitter) y Messenger, con Inteligencia Artificial (Google Gemini 3.6 Flash), Tablero Kanban de Ventas, Campañas Masivas, Automatizaciones y Módulo de Respuestas Rápidas con Botones Persistentes.

---

## 📑 Tabla de Contenidos
1. [Introducción y Propósito](#1-introducción-y-propósito)
2. [Arquitectura y Stack Tecnológico](#2-arquitectura-y-stack-tecnológico)
3. [Módulos del Sistema](#3-módulos-del-sistema)
   - 3.1 [Inbox Omnicanal & Extensión WhatsApp](#31-inbox-omnicanal--extensión-whatsapp)
   - 3.2 [Gestor de Respuestas Rápidas y Botones Disponibles](#32-gestor-de-respuestas-rápidas-y-botones-disponibles)
   - 3.3 [CRM Kanban & Embudo de Ventas](#33-crm-kanban--embudo-de-ventas)
   - 3.4 [Segmentación de Leads](#34-segmentación-de-leads)
   - 3.5 [Campañas Masivas & Copywriting con IA](#35-campañas-masivas--copywriting-con-ia)
   - 3.6 [Automatizaciones y Disparadores](#36-automatizaciones-y-disparadores)
   - 3.7 [API REST, Webhooks y Auditoría](#37-api-rest-webhooks-y-auditoría)
   - 3.8 [Métricas y Analítica](#38-métricas-y-analítica)
4. [Inteligencia Artificial con Google Gemini](#4-inteligencia-artificial-con-google-gemini)
5. [Endpoints del Servidor Backend](#5-endpoints-del-servidor-backend)
6. [Estructura del Proyecto y Modelos de Datos](#6-estructura-del-proyecto-y-modelos-de-datos)
7. [Guía de Instalación, Configuración y Despliegue](#7-guía-de-instalación-configuración-y-despliegue)

---

## 1. Introducción y Propósito

**XIO CRM** es una solución diseñada para equipos de ventas, soporte al cliente y atención multiagente. Su objetivo es centralizar las conversaciones provenientes de múltiples canales de mensajería (WhatsApp, Instagram, Twitter/X, Messenger) y dotar a los asesores comerciales de herramientas de productividad:
- Respuestas instantáneas y botones configurables con plantillas de texto e imágenes adjuntas.
- Calificación y seguimiento de leads mediante tableros Kanban.
- Automatizaciones de flujos de trabajo según interacciones del cliente.
- Asistencia en tiempo real con Inteligencia Artificial para generar respuestas inteligentes, resúmenes ejecutivos de conversaciones y copys publicitarios de alto impacto.

---

## 2. Arquitectura y Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | SPA modular, reactiva y tipada con componentes desacoplados. |
| **Estilos** | Tailwind CSS v4 | Diseño responsivo con estética moderna inspirada en WhatsApp Web. |
| **Iconografía** | Lucide React | Paquete estándar de íconos vectoriales SVG. |
| **Gráficos** | Recharts | Visualización de métricas y analítica del embudo. |
| **Backend** | Express + Node.js | Servidor backend seguro para proxy de IA y APIs REST. |
| **Motor de IA** | `@google/genai` (Gemini 3.6 Flash) | Procesamiento de lenguaje natural ejecutado en el servidor. |
| **Empaquetado** | Vite + esbuild | Compilación optimizada frontend (Vite) y backend CommonJS (`dist/server.cjs`). |
| **Persistencia** | `localStorage` + Estado React | Almacenamiento persistente de configuraciones, botones e imágenes. |

---

## 3. Módulos del Sistema

### 3.1 Inbox Omnicanal & Extensión WhatsApp
- **Filtros por Canal:** Pestañas para alternar entre todas las conversaciones o filtrar por WhatsApp, Instagram, Twitter/X y Messenger.
- **Visualizador de Hilos de Chat:** Mensajes con diseño de burbujas, marcas de tiempo, estados de entrega (✓✓) y etiquetas visuales de "Bot IA" o "Agente".
- **Barra de Acceso Rápido:** Lista horizontal con los botones de respuestas rápidas creados por el usuario, notas de voz y cargador de archivos multimedia.
- **Panel Lateral de Extensión XIO CRM:**
  - Información del contacto (teléfono, correo, empresa, notas).
  - Score de probabilidad de cierre asistido por IA (0 a 100).
  - Selector de etapa del embudo (Prospecto, Cualificado, Negociación, Venta Ganada, Perdido).
  - Agendador directo con **Google Calendar** para reuniones y llamadas con el cliente.
  - Gestión rápida de etiquetas de segmentación.

---

### 3.2 Gestor de Respuestas Rápidas y Botones Disponibles

Ubicado en el modal de configuración accesible desde el Inbox:

- **Sección "BOTONES DISPONIBLES":**
  - **Creación Ilimitada (+ Nuevo):** Permite añadir nuevos botones de respuesta rápida personalizados.
  - **Guardado Persistente Automático:** Todos los botones creados se guardan permanentemente en el estado y en `localStorage` (`xio_crm_quick_replies_v2`), persistiendo tras recargas de página o cierres del navegador.
  - **Ícono de Borrado Dedicado (🗑️):** Cada botón en la lista cuenta con un botón de borrado visible e interactivo que solicita confirmación antes de eliminar el botón de forma definitiva.
  - **Buscador y Filtros por Categoría:** Búsqueda en tiempo real por texto y filtros (Saludos, Ventas, Precios, Soporte, General).
  - **Duplicador:** Opción para clonar un botón existente con un solo clic.

- **Editor del Botón Seleccionado:**
  - Selector de Emoji/Ícono identificador.
  - Título visible del botón en la barra del chat.
  - Selector de categoría temática.
  - **Variables Dinámicas:** Inserción rápida de `{nombre}`, `{empresa}`, `{canal}` y `{agente}` que se sustituyen automáticamente al enviar el mensaje al contacto activo.
  - **Galería de Imágenes Adjuntas:** Posibilidad de asociar una imagen de la galería predeterminada o subir nuevas imágenes desde el ordenador / URL directa.
  - **Vista Previa en Vivo:** Simulación en tiempo real de cómo verá el cliente el mensaje con su texto e imagen en WhatsApp Web.
  - **Acción "Borrar Botón":** Botón de eliminación directa en la barra inferior del editor.

---

### 3.3 CRM Kanban & Embudo de Ventas
- **Columnas de Etapas:**
  1. *Prospectos Iniciales* (Lead recién captado).
  2. *Cualificados* (Interés validado o primera respuesta).
  3. *En Negociación* (Cita agendada o propuesta enviada).
  4. *Venta Ganada 🎉* (Contrato o pago confirmado).
  5. *Perdidos* (Descartados o sin respuesta).
- **Métricas Financieras en Vivo:** Sumatoria del valor total del Pipeline y volumen de ventas ganadas en USD.
- **Acciones Rápidas por Tarjeta:** Envío directo de mensaje a WhatsApp, llamada telefónica o cambio de etapa.
- **Vista de Tabla Alternativa:** Listado tabular con filtros avanzados, búsqueda y ordenación.

---

### 3.4 Segmentación de Leads
- Creación de audiencias con condiciones lógicas:
  - Filtro por canales de origen.
  - Filtro por etiquetas específicas.
  - Filtro por etapa del embudo o puntuación mínima de IA.
- Conexión directa con el módulo de campañas para lanzar difusiones específicas al segmento.

---

### 3.5 Campañas Masivas & Copywriting con IA
- Creación de campañas masivas de difusión para WhatsApp, Instagram y Email.
- **Asistente de Copywriting con Gemini 3.6 Flash:**
  - El usuario ingresa el objetivo de la campaña (ej. "Lanzamiento de descuento anual del 30%").
  - Selecciona el canal y tono de voz (Profesional, Persuasivo, Urgencia, Amigable).
  - La IA genera 3 variaciones completas optimizadas con emojis, llamados a la acción (CTA) y hashtags.
- Monitor de métricas de entrega, apertura, tasa de clics y conversiones.

---

### 3.6 Automatizaciones y Disparadores
- Configuración de reglas automáticas tipo *Trigger ➔ Action*:
  - *Trigger:* Mensaje entrante con palabras clave específicas, asignación de etiqueta o inactividad de más de 24 horas.
  - *Action:* Enviar plantilla de WhatsApp, asignar a un agente específico o mover de etapa en el embudo.
- Simulador interactivo para probar la ejecución de las reglas en tiempo real.

---

### 3.7 API REST, Webhooks y Auditoría
- Generación y administración de API Keys con diferentes niveles de permisos (Lectura/Escritura).
- Configuración de Webhook de salida para notificar a sistemas externos (Zapier, Make, ERP) ante eventos como `lead.created`, `lead.stage_updated` o `message.received`.
- Registro de auditoría (Webhook Logs) con código de respuesta HTTP, carga útil JSON y tiempo de respuesta en milisegundos.

---

### 3.8 Métricas y Analítica
- Gráficos de distribución de prospectos por canal.
- Tiempos medios de respuesta por asesor comercial.
- Tasa de conversión histórica por etapa del funnel.
- Análisis de sentimiento de clientes atendidos (Positivo, Neutral, Urgente, Riesgo Churn).

---

## 4. Inteligencia Artificial con Google Gemini

El sistema utiliza el SDK oficial `@google/genai` con el modelo `gemini-3.6-flash`. Por directrices estrictas de seguridad:
- La clave `GEMINI_API_KEY` se ejecuta exclusivamente en el servidor Node.js (`server.ts`).
- Ninguna clave privada se expone al navegador o cliente.

### Funcionalidades de IA:
1. **Smart Replies:** Sugiere 3 respuestas adaptadas al contexto y calcula el sentimiento del cliente.
2. **Resumen Ejecutivo:** Sintetiza el historial completo del chat, detectando intención del cliente y siguiente acción comercial sugerida.
3. **Generador de Copys de Campaña:** Redacta textos persuasivos adaptados al canal.
4. **Chatbot Autoresponder:** Responde automáticamente a dudas frecuentes de prospectos en el canal de simulación.

---

## 5. Endpoints del Servidor Backend

| Método | Ruta | Parámetros (Body) | Respuesta |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Ninguno | `{ status: "ok", geminiConfigured: boolean }` |
| `POST` | `/api/ai/smart-reply` | `{ conversationHistory, contactName, channel, stage }` | 3 sugerencias de texto, razonamiento y sentimiento. |
| `POST` | `/api/ai/summarize` | `{ messages, contactName }` | Resumen, intención clave y próxima acción. |
| `POST` | `/api/ai/campaign-copy` | `{ objective, targetAudience, tone, channel }` | 3 variantes de copy publicitario estructurado. |
| `POST` | `/api/ai/chatbot-autorespond`| `{ incomingMessage, channel, contactName, companyNotes }` | Respuesta generada por el bot para el chat. |
| `POST` | `/api/webhooks/test` | `{ url, event, secretKey }` | Simulación de envío webhook con payload y status 200. |

---

## 6. Estructura del Proyecto y Modelos de Datos

### Árbol de Archivos Principales
```
├── .env.example                      # Declaración de variables requeridas
├── metadata.json                     # Metadatos de la aplicación
├── package.json                      # Dependencias y scripts
├── server.ts                         # Servidor Express + Endpoints IA + Middleware Vite
├── src/
│   ├── main.tsx                      # Punto de entrada de React
│   ├── App.tsx                       # Componente raíz y estado global
│   ├── types.ts                      # Tipos e interfaces TypeScript
│   ├── mockData.ts                   # Datos iniciales para el CRM
│   ├── index.css                     # Tailwind CSS v4
│   └── components/
│       ├── Header.tsx                # Barra superior de navegación y búsqueda
│       ├── Sidebar.tsx               # Menú lateral de módulos
│       ├── GithubModal.tsx           # Diálogo para exportación y despliegue
│       ├── Inbox/
│       │   ├── InboxView.tsx         # Vista de mensajería y extensión
│       │   └── QuickRepliesModal.tsx # Gestor de Botones Disponibles e Imágenes
│       ├── Contacts/
│       │   └── ContactsView.tsx      # Tablero Kanban y tabla de clientes
│       ├── Segments/
│       │   └── SegmentsView.tsx      # Constructor de audiencias
│       ├── Campaigns/
│       │   └── CampaignsView.tsx     # Difusiones masivas y redacción IA
│       ├── Automation/
│       │   └── AutomationView.tsx    # Motor de reglas y disparadores
│       ├── ApiGithub/
│       │   └── ApiGithubView.tsx     # Claves API y Webhooks
│       └── Analytics/
│           └── AnalyticsView.tsx     # Cuadro de mando y reportes
```

---

## 7. Guía de Instalación, Configuración y Despliegue

### 1. Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes npm o yarn.

### 2. Configuración de Variables de Entorno
Crea un archivo `.env` basado en `.env.example`:
```env
GEMINI_API_KEY="tu_clave_de_gemini_api"
```

### 3. Instalación y Ejecución Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en puerto 3000
npm run dev
```

### 4. Compilación y Despliegue en Producción
```bash
# Compilar SPA (Vite) y empaquetar servidor backend (esbuild a dist/server.cjs)
npm run build

# Iniciar servidor de producción
npm run start
```
El servidor quedará disponible en `http://localhost:3000`.

---
*Documentación generada para XIO CRM / Whato Inbox.*
