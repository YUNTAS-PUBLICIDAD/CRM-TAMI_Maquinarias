import React from 'react';
import { 
  MessageSquare, Users, Target, Send, Zap, BarChart3, Code2, 
  Sparkles, Bell, Search, Radio, Download, ShieldCheck, Chrome, HelpCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSimulateIncomingMessage: () => void;
  onOpenGithubModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSimulateIncomingMessage,
  onOpenGithubModal,
  searchQuery,
  setSearchQuery
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'inbox': return 'Inbox Omnicanal Whato (WhatsApp Multi-Agente & Extension)';
      case 'contacts': return 'CRM Kanban de Ventas WhatsApp & Clientes';
      case 'segments': return 'Segmentos & Filtros Avanzados de Audiencia';
      case 'campaigns': return 'Difusión Masiva en WhatsApp & Asistente IA';
      case 'automation': return 'Automatización, Reglas & Auto-respondedores';
      case 'analytics': return 'Métricas de Rendimiento & Reportes en Tiempo Real';
      case 'api-github': return 'Integración API REST, Webhooks & Exportación GitHub';
      default: return 'Whato CRM';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Title & Connection Badges */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {getTabTitle(activeTab)}
          </h1>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              WhatsApp Web Conectado (+57 310 892...)
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Chrome className="w-3.5 h-3.5 text-emerald-600" />
              Extensión Whato v3.4.1
            </span>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Bar */}
        <div className="relative hidden lg:block w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por teléfono, nombre, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Incoming Message Simulator Button */}
        <button
          onClick={onSimulateIncomingMessage}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Simular llegada de mensaje entrante a WhatsApp"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Simular Chat Entrante</span>
        </button>

        {/* GitHub Export / Download Button */}
        <button
          onClick={onOpenGithubModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          title="Exportar proyecto para GitHub"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">GitHub</span>
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};
