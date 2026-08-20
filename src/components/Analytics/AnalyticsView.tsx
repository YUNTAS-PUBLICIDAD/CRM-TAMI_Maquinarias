import React from 'react';
import { AnalyticsData } from '../../types';
import { 
  BarChart3, TrendingUp, Clock, Users, Zap, DollarSign, Activity, Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from 'recharts';

interface AnalyticsViewProps {
  data: AnalyticsData;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Analítica en Tiempo Real & Toma de Decisiones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas clave de volumen omnicanal, eficiencia de agentes, tasa de conversión y ROI de marketing.
          </p>
        </div>
      </div>

      {/* Main Charts & KPI Canvas */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Conversaciones</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{data.totalConversations.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% este mes</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Tiempo Respuesta SLA</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{data.avgResponseTimeMin} min</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Optimizado con Respuestas IA</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Tasa de Conversión</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{data.leadConversionRate}%</div>
            <div className="text-[11px] text-indigo-600 font-bold">380 Ventas Ganadas este mes</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">ROI de Campañas</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{data.campaignRoi}%</div>
            <div className="text-[11px] text-emerald-600 font-bold">4.1x Retorno de Inversión</div>
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Growth Area Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Evolución Mensual de Conversiones de Leads</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyConversions}>
                  <defs>
                    <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="closed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClosed)" name="Ventas Cerradas" />
                  <Area type="monotone" dataKey="leads" stroke="#cbd5e1" strokeWidth={2} fillOpacity={0.1} fill="#cbd5e1" name="Leads Totales" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Channel Distribution Donut Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Distribución de Mensajes por Canal Social</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.channelBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="channel"
                  >
                    {data.channelBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold pt-2">
              {data.channelBreakdown.map(item => (
                <div key={item.channel} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="capitalize text-slate-700">{item.channel}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2: Sentiment Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Análisis de Sentimiento de Clientes por IA</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sentimentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sentiment" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.sentimentBreakdown.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
