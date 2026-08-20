import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily/safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY system secret is required.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'SocialSync CRM',
      timestamp: new Date().toISOString(),
      serverAiEnabled: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // 1. AI Smart Reply Generator
  app.post('/api/ai/smart-reply', async (req, res) => {
    try {
      const { conversationHistory, contactName, channel, stage } = req.body;
      const ai = getAiClient();

      const prompt = `
Eres un asistente experto de CRM omnicanal para ventas y soporte al cliente en español.
Genera 3 opciones de respuesta rápida para el cliente "${contactName || 'Cliente'}" en el canal "${channel || 'whatsapp'}".
Etapa de venta actual del cliente: "${stage || 'lead'}".

Historial reciente de la conversación:
${JSON.stringify(conversationHistory || [], null, 2)}

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON CON ESTA ESTRUCTURA EXACTA:
{
  "sentiment": "positive" | "neutral" | "urgent" | "churn_risk",
  "suggestedReplies": [
    { "label": "Casual / Amigable", "text": "..." },
    { "label": "Profesional / Formal", "text": "..." },
    { "label": "Cierre / Oferta Directa", "text": "..." }
  ],
  "reasoning": "Breve explicación de la estrategia seleccionada"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Error in /api/ai/smart-reply:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar respuestas IA'
      });
    }
  });

  // 2. AI Marketing Campaign Copy Generator
  app.post('/api/ai/campaign-copy', async (req, res) => {
    try {
      const { campaignTopic, targetChannel, productOffer, tone } = req.body;
      const ai = getAiClient();

      const prompt = `
Eres un especialista de Copywriting y Marketing Omnicanal en español.
Crea 3 variaciones de copy publicitario optimizadas para el canal "${targetChannel || 'whatsapp'}".
Tema de campaña: "${campaignTopic}"
Oferta / Producto: "${productOffer}"
Tono de voz: "${tone || 'Persuasivo y directo'}"

Debes adaptar el estilo al canal:
- Si es WhatsApp: Usa emojis, viñetas claras y un llamado a la acción directo con palabra clave.
- Si es Instagram: Incluye gancho inicial visual, emojis elegantes y hashtags relevantes.
- Si es Twitter/X: Mantenlo conciso, de alto impacto y fácil de retuitear.
- Si es Email/Messenger: Asunto atrayente y cuerpo estructurado.

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
{
  "variations": [
    {
      "title": "Opción 1 - Enfoque Urgencia / Valor",
      "content": "Texto del mensaje con emojis y CTA"
    },
    {
      "title": "Opción 2 - Enfoque Educativo / Beneficios",
      "content": "Texto del mensaje..."
    },
    {
      "title": "Opción 3 - Enfoque Directo a Conversión",
      "content": "Texto del mensaje..."
    }
  ],
  "recommendedHashtags": ["#Tag1", "#Tag2"],
  "callToAction": "Texto recomendado para el botón o palabra clave"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Error in /api/ai/campaign-copy:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar copy de campaña con IA'
      });
    }
  });

  // 3. AI Summarize Conversation & Lead Insights
  app.post('/api/ai/summarize', async (req, res) => {
    try {
      const { messages, contactName } = req.body;
      const ai = getAiClient();

      const prompt = `
Resume la siguiente conversación de CRM con el cliente ${contactName || ''} en español.
Identifica la intención principal, objeciones y el siguiente paso sugerido.

Historial:
${JSON.stringify(messages || [], null, 2)}

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
{
  "summary": "Resumen ejecutivo en 2 oraciones",
  "keyIntent": "Intención principal (e.g. Solicita cotización anual, Consulta técnica API, etc.)",
  "suggestedNextAction": "Acción inmediata recomendada para el agente",
  "recommendedScore": 85
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Error in /api/ai/summarize:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al resumir conversación'
      });
    }
  });

  // 4. AI Chatbot Auto-Responder Simulator
  app.post('/api/ai/chatbot-autorespond', async (req, res) => {
    try {
      const { incomingMessage, channel, contactName, companyNotes } = req.body;
      const ai = getAiClient();

      const prompt = `
Eres un bot inteligente de CRM omnicanal para SocialSync.
Atiende el mensaje entrante del usuario "${contactName || 'Usuario'}" que escribió por el canal "${channel || 'whatsapp'}".
Notas previas del cliente: "${companyNotes || 'Nuevo prospecto'}"
Mensaje del usuario: "${incomingMessage}"

Genera una respuesta servicial, concisa, natural e informativa. Si pregunta precios o funciones, indícale las opciones clave y ofrece conectarlo con un asesor humano o agendar demo.

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
{
  "botReply": "Texto de respuesta del bot",
  "autoTag": "Etiqueta sugerida para agregar al contacto",
  "detectedSentiment": "positive" | "neutral" | "urgent" | "churn_risk"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Error in /api/ai/chatbot-autorespond:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error en auto-respuesta del bot'
      });
    }
  });

  // 5. Test Webhook Simulator
  app.post('/api/webhooks/test', async (req, res) => {
    const { webhookUrl, event, payload } = req.body;
    const timestamp = new Date().toISOString();

    res.json({
      success: true,
      delivered: true,
      statusCode: 200,
      timestamp,
      event: event || 'message.received',
      webhookUrl: webhookUrl || 'https://api.empresa.com/v1/socialcrm/events',
      signature: 'sha256=' + Buffer.from(timestamp + JSON.stringify(payload)).toString('hex').substring(0, 32),
      message: 'Simulación de webhook entregado con éxito a tu API externa'
    });
  });

  // Vite Integration in Dev / Static Serving in Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SocialSync CRM running on http://localhost:${PORT}`);
  });
}

startServer();
