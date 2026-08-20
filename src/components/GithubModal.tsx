import React, { useState } from 'react';
import { Download, CheckCircle2, Copy, FileCode, Terminal, ExternalLink, Github } from 'lucide-react';

interface GithubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubModal: React.FC<GithubModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envTemplate = `# Configuración SocialSync CRM
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=tu_api_key_de_google_ai
APP_URL=https://tu-dominio.com`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Exportación para GitHub & Despliegue</h3>
              <p className="text-xs text-slate-500">Proyecto Social CRM 100% autodistribuible y modular</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 font-bold cursor-pointer text-sm">✕</button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 leading-relaxed font-medium">
            ✅ Este proyecto incluye servidor backend Express, frontend React + Vite, soporte para Gemini API server-side y webhooks integrados.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Pasos para publicar en tu GitHub:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium">
              <li>Haz clic en el menú superior derecho de AI Studio: <strong>Ajustes → Exportar a GitHub</strong> o descarga el archivo ZIP.</li>
              <li>Asegúrate de agregar tu <code className="bg-slate-100 px-1 rounded text-indigo-600">GEMINI_API_KEY</code> en las variables de entorno de tu hosting (Cloud Run, Vercel, Railway, Render).</li>
              <li>Ejecuta <code className="bg-slate-100 px-1 rounded">npm install</code> e inicia con <code className="bg-slate-100 px-1 rounded">npm run dev</code>.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Plantilla de Archivo .env</span>
              <button
                onClick={copyEnv}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? '¡Copiado!' : 'Copiar .env'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
              {envTemplate}
            </pre>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
