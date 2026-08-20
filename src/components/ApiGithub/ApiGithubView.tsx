import React, { useState } from 'react';
import { ApiKey, WebhookConfig, WebhookLog } from '../../types';
import { 
  Code2, Key, Globe, Terminal, Play, Download, CheckCircle2, 
  Copy, RefreshCw, FileCode, ShieldCheck, ExternalLink, Cpu 
} from 'lucide-react';

interface ApiGithubViewProps {
  apiKeys: ApiKey[];
  webhookConfig: WebhookConfig;
  webhookLogs: WebhookLog[];
  onOpenGithubModal: () => void;
}

export const ApiGithubView: React.FC<ApiGithubViewProps> = ({
  apiKeys,
  webhookConfig,
  webhookLogs,
  onOpenGithubModal
}) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'keys' | 'github'>('playground');

  // API Playground State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/ai/chatbot-autorespond');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({
      incomingMessage: "¿Cuáles son los planes de precios y cómo se conecta a WhatsApp?",
      channel: "whatsapp",
      contactName: "Valeria Gómez",
      companyNotes: "Lead de alta intención"
    }, null, 2)
  );

  const [responseResult, setResponseResult] = useState<any>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRunApiRequest = async () => {
    setIsLoadingApi(true);
    setResponseResult(null);

    const startTime = performance.now();
    try {
      let parsedBody = {};
      if (selectedEndpoint !== '/api/health') {
        parsedBody = JSON.parse(requestBody);
      }

      const res = await fetch(selectedEndpoint, {
        method: selectedEndpoint === '/api/health' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: selectedEndpoint === '/api/health' ? undefined : JSON.stringify(parsedBody)
      });

      const data = await res.json();
      const endTime = performance.now();

      setResponseResult({
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(endTime - startTime),
        data
      });
    } catch (err: any) {
      setResponseResult({
        status: 500,
        error: err.message || 'Error executing request'
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            Integraciones API Personalizada, Webhooks & GitHub Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conecta tu backend propio, prueba endpoints en tiempo real y descarga el código fuente para GitHub.
          </p>
        </div>

        <button
          onClick={onOpenGithubModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Código para GitHub</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'playground' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🎮 Playground de API REST
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'keys' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔑 Claves API & Webhooks Subscritos
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'github' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📁 Guía de Despliegue en GitHub
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left: Request Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Probador Interactivo de Endpoints API
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seleccionar Endpoint</label>
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => {
                      const ep = e.target.value;
                      setSelectedEndpoint(ep);
                      if (ep === '/api/ai/chatbot-autorespond') {
                        setRequestBody(JSON.stringify({
                          incomingMessage: "¿Cuáles son los planes de precios y cómo se conecta a WhatsApp?",
                          channel: "whatsapp",
                          contactName: "Valeria Gómez",
                          companyNotes: "Lead de alta intención"
                        }, null, 2));
                      } else if (ep === '/api/ai/smart-reply') {
                        setRequestBody(JSON.stringify({
                          conversationHistory: [
                            { sender: "contact", text: "Me interesa contratar el plan Enterprise para 15 usuarios" }
                          ],
                          contactName: "Valeria Gómez",
                          channel: "whatsapp",
                          stage: "negotiation"
                        }, null, 2));
                      } else if (ep === '/api/webhooks/test') {
                        setRequestBody(JSON.stringify({
                          webhookUrl: "https://api.empresa.com/v1/socialcrm/events",
                          event: "message.received",
                          payload: { contactId: "c1", text: "Mensaje entrante de prueba" }
                        }, null, 2));
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  >
                    <option value="/api/ai/chatbot-autorespond">POST /api/ai/chatbot-autorespond (Respuesta Bot IA)</option>
                    <option value="/api/ai/smart-reply">POST /api/ai/smart-reply (Sugerencias Rápida IA)</option>
                    <option value="/api/webhooks/test">POST /api/webhooks/test (Simular Evento Webhook)</option>
                    <option value="/api/health">GET /api/health (Estado del Servidor)</option>
                  </select>
                </div>

                {selectedEndpoint !== '/api/health' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cuerpo de Solicitud (JSON Payload)</label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={10}
                      className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleRunApiRequest}
                  disabled={isLoadingApi}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isLoadingApi ? 'Ejecutando llamada API...' : 'Ejecutar Solicitud HTTP'}</span>
                </button>
              </div>
            </div>

            {/* Right: Response Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between text-xs space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="font-mono text-slate-400 font-bold">Respuesta del Servidor HTTP</span>
                  {responseResult && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[10px]">
                        HTTP {responseResult.status} OK
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {responseResult.durationMs}ms
                      </span>
                    </div>
                  )}
                </div>

                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {responseResult ? (
                    JSON.stringify(responseResult.data || responseResult, null, 2)
                  ) : (
                    '// Haz clic en "Ejecutar Solicitud HTTP" para ver la respuesta en vivo...'
                  )}
                </pre>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-slate-400 text-[11px]">
                💡 Tip: Esta API soporta encabezados de autenticación Bearer Token con las claves generadas en el tab "Claves API".
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* API Keys Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Claves de Acceso API REST (API Keys)
              </h3>

              <div className="space-y-2">
                {apiKeys.map(k => (
                  <div key={k.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{k.name}</div>
                      <div className="font-mono text-slate-500 text-[11px] mt-0.5">{k.key}</div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(k.key, k.id)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === k.id ? '¡Copiado!' : 'Copiar Key'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Settings & Activity Logs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Endpoint de Webhook Suscrito
              </h3>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">URL del Webhook de Eventos:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    Activo (SSL)
                  </span>
                </div>
                <div className="font-mono text-indigo-700 font-bold bg-white p-2 border border-slate-200 rounded-lg">
                  {webhookConfig.url}
                </div>
              </div>

              {/* Webhook Activity Logs */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800">Últimos Eventos Entregados (Logs HTTP)</h4>
                <div className="bg-slate-900 rounded-xl p-3 text-slate-300 font-mono text-[11px] space-y-2">
                  {webhookLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-emerald-400 font-bold">[{log.statusCode}] {log.event}</span>
                      <span className="text-slate-400">{log.timestamp} ({log.durationMs}ms)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'github' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                Guía de Instalación y Despliegue desde GitHub
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Este proyecto está pre-configurado con estructura modular Express + Vite para desplegarse instantáneamente en cualquier servidor Node.js o Docker.
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-3">
              <div>
                <span className="text-slate-500"># 1. Clonar el repositorio descargado de GitHub</span>
                <div className="text-emerald-400 font-bold">git clone https://github.com/tu-usuario/socialsync-crm.git</div>
                <div className="text-emerald-400 font-bold">cd socialsync-crm</div>
              </div>

              <div>
                <span className="text-slate-500"># 2. Instalar dependencias</span>
                <div className="text-emerald-400 font-bold">npm install</div>
              </div>

              <div>
                <span className="text-slate-500"># 3. Configurar variables de entorno en .env</span>
                <div className="text-indigo-300 font-bold">GEMINI_API_KEY="tu_clave_de_gemini_api"</div>
                <div className="text-indigo-300 font-bold">PORT=3000</div>
              </div>

              <div>
                <span className="text-slate-500"># 4. Iniciar servidor de desarrollo con hot reload</span>
                <div className="text-emerald-400 font-bold">npm run dev</div>
              </div>
            </div>

            <button
              onClick={onOpenGithubModal}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Abrir Modal de Exportación y Descarga de Código Fuente</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
