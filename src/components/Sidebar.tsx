import React from 'react';
import { 
  MessageSquare, Users, Target, Send, Zap, BarChart3, Code2, 
  Sparkles, Layers, ShieldCheck, Download, Chrome, Star, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadTotal: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadTotal
}) => {
  const menuItems = [
    {
      id: 'inbox',
      label: 'Inbox WhatsApp & Chat',
      icon: MessageSquare,
      badge: unreadTotal > 0 ? unreadTotal : null,
      badgeColor: 'bg-emerald-500 text-white font-bold'
    },
    {
      id: 'contacts',
      label: 'CRM Kanban & Clientes',
      icon: Users,
      badge: 'Ventas',
      badgeColor: 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-800'
    },
    {
      id: 'segments',
      label: 'Segmentos de Leads',
      icon: Target
    },
    {
      id: 'campaigns',
      label: 'Difusión Masiva & IA',
      icon: Send,
      badge: 'IA',
      badgeColor: 'bg-indigo-950 text-indigo-400 font-bold border border-indigo-800'
    },
    {
      id: 'automation',
      label: 'Flujos & Automatizaciones',
      icon: Zap
    },
    {
      id: 'analytics',
      label: 'Analítica & Reportes',
      icon: BarChart3
    },
    {
      id: 'api-github',
      label: 'API & Webhooks',
      icon: Code2
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800/80">
      {/* Whato Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-xl tracking-tight shrink-0">
            W
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              <span>Whato</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold">
                CRM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">WhatsApp & Omnichannel Sales</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Plataforma Multiagente
          </p>
          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Extensión Activa
          </span>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Internal Management Status Panel */}
      <div className="p-3.5 m-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Gestión Interna
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Whato Enterprise</span>
        </div>

        <div className="space-y-1.5 text-slate-300 text-[11px] font-medium">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">WhatsApp Web:</span>
            <span className="text-emerald-400 font-bold">Conectado (4)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Motor IA Gemini:</span>
            <span className="text-indigo-400 font-bold">Activo v3.6</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Google Calendar:</span>
            <span className="text-emerald-400 font-bold">Sincronizado</span>
          </div>
        </div>

        <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Servidor Cloud</span>
          <span className="font-mono text-slate-400">3000-OK</span>
        </div>
      </div>
    </aside>
  );
};
