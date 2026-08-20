import React, { useState } from 'react';
import { Campaign, Segment, SocialChannel } from '../../types';
import { 
  Send, Sparkles, Plus, Play, CheckCircle2, Clock, BarChart2, 
  Copy, RefreshCw, Zap, ThumbsUp 
} from 'lucide-react';

interface CampaignsViewProps {
  campaigns: Campaign[];
  segments: Segment[];
  onCreateCampaign: (newCampaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'openRate' | 'clickRate' | 'conversions'>) => void;
  preselectedSegmentId?: string;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  segments,
  onCreateCampaign,
  preselectedSegmentId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<SocialChannel>('whatsapp');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(preselectedSegmentId || (segments[0]?.id || 'seg_1'));
  const [offerTopic, setOfferTopic] = useState('');
  const [content, setContent] = useState('');

  // AI Copy Generation State
  const [isAiCopyLoading, setIsAiCopyLoading] = useState(false);
  const [aiVariations, setAiVariations] = useState<{ title: string; content: string }[] | null>(null);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);

  // Call Server-Side Gemini AI Campaign Copy Endpoint
  const handleGenerateAiCopy = async () => {
    if (!offerTopic.trim()) return;
    setIsAiCopyLoading(true);

    try {
      const response = await fetch('/api/ai/campaign-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTopic: title || 'Lanzamiento Promocional',
          targetChannel: channel,
          productOffer: offerTopic,
          tone: 'Persuasivo, profesional y directo'
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiVariations(resData.data.variations || []);
        setAiHashtags(resData.data.recommendedHashtags || []);
      }
    } catch (err) {
      console.error('Error generating AI copy:', err);
    } fontally: {
      setIsAiCopyLoading(false);
    }
  };

  const handleSaveCampaign = (status: 'draft' | 'running') => {
    const targetSeg = segments.find(s => s.id === selectedSegmentId);
    onCreateCampaign({
      title: title || 'Nueva Campaña Omnicanal',
      channel,
      segmentId: selectedSegmentId,
      segmentName: targetSeg?.name || 'Segmento General',
      content: content || 'Contenido de la campaña.',
      status
    });

    setIsModalOpen(false);
    setTitle('');
    setOfferTopic('');
    setContent('');
    setAiVariations(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600" />
            Campañas de Marketing & Difusión Masiva
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Genera textos persuasivos con IA y transmite broadcasts en WhatsApp, Instagram y X/Twitter.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Crear Campaña con IA</span>
        </button>
      </div>

      {/* Campaigns List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(camp => (
            <div
              key={camp.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase rounded">
                      {camp.channel}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      camp.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {camp.status === 'completed' ? 'Completada' : 'En Ejecución'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{camp.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Audiencia: <span className="text-indigo-600 font-bold">{camp.segmentName}</span>
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono leading-relaxed">
                "{camp.content}"
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">ENVIADOS</span>
                  <span className="font-bold text-xs text-slate-900">{camp.sentCount}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">APERTURA</span>
                  <span className="font-bold text-xs text-indigo-600">{camp.openRate}%</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">CLICS</span>
                  <span className="font-bold text-xs text-purple-600">{camp.clickRate}%</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">CONVERSIONES</span>
                  <span className="font-bold text-xs text-emerald-600">{camp.conversions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE CAMPAIGN WITH IA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Creador de Campañas Asistido por IA (Gemini 3.6)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de Campaña</label>
                  <input
                    type="text"
                    placeholder="Ej: Promo Descuento Módulo IA"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Canal de Difusión</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as SocialChannel)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="whatsapp">WhatsApp Broadcast</option>
                    <option value="instagram">Instagram DMs</option>
                    <option value="twitter">X / Twitter Direct</option>
                    <option value="messenger">Facebook Messenger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Segmento Objetivo de Audiencia</label>
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {segments.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactCount} Clientes)</option>
                  ))}
                </select>
              </div>

              {/* AI Prompt Input */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <label className="font-bold text-indigo-900 block">
                  1. Indícale a la IA el producto o beneficio de la oferta:
                </label>
                <textarea
                  placeholder="Ej: Ofrecemos 20% de descuento en el plan anual de Social CRM con automatización de WhatsApp e IA. Código: PLAN20."
                  value={offerTopic}
                  onChange={(e) => setOfferTopic(e.target.value)}
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleGenerateAiCopy}
                  disabled={isAiCopyLoading || !offerTopic.trim()}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{isAiCopyLoading ? 'Generando variaciones con Gemini...' : '✨ Generar Variaciones de Textos con IA'}</span>
                </button>
              </div>

              {/* AI Generated Variations Selection */}
              {aiVariations && aiVariations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-slate-800 block">
                    2. Selecciona la variación preferida:
                  </label>
                  <div className="space-y-2">
                    {aiVariations.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => setContent(v.content)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all text-xs space-y-1 ${
                          content === v.content ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs font-medium' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-indigo-900 flex items-center justify-between">
                          <span>{v.title}</span>
                          {content === v.content && <span className="text-indigo-600 font-extrabold text-xs">✓ Seleccionado</span>}
                        </div>
                        <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                          "{v.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Final Content */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">3. Mensaje Final de la Campaña</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="El texto seleccionado se cargará aquí para enviar..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCampaign('draft')}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium cursor-pointer"
                >
                  Guardar Borrador
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCampaign('running')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  🚀 Disparar Campaña Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
