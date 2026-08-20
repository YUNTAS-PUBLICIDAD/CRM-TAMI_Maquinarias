import React, { useState } from 'react';
import { Segment, SocialChannel, Contact } from '../../types';
import { Target, Users, Plus, Filter, Sparkles, Send, Check } from 'lucide-react';

interface SegmentsViewProps {
  segments: Segment[];
  contacts: Contact[];
  onCreateSegment: (newSegment: Omit<Segment, 'id' | 'createdAt' | 'contactCount'>) => void;
  onSelectSegmentForCampaign: (segmentId: string) => void;
}

export const SegmentsView: React.FC<SegmentsViewProps> = ({
  segments,
  contacts,
  onCreateSegment,
  onSelectSegmentForCampaign
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<SocialChannel[]>(['whatsapp']);
  const [minScore, setMinScore] = useState<number>(70);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onCreateSegment({
      name,
      description: description || 'Segmento personalizado creado por el usuario.',
      channels: selectedChannels,
      minScore
    });

    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const toggleChannel = (ch: SocialChannel) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter(c => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Segmentación de Audiencia & Clusters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea grupos dinámicos de clientes basados en comportamiento, canal y score de IA para campañas masivas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Segmento</span>
        </button>
      </div>

      {/* Segments Cards Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {segments.map(seg => (
            <div
              key={seg.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold rounded-full border border-slate-200">
                    {seg.contactCount} Clientes
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{seg.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{seg.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Canales Activos:</span>
                  <div className="flex items-center gap-1 uppercase font-bold text-[10px] text-indigo-700">
                    {seg.channels.join(', ')}
                  </div>
                </div>

                {seg.minScore && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Score Mínimo IA:</span>
                    <span className="font-bold text-indigo-600">{seg.minScore}+ pts</span>
                  </div>
                )}

                <button
                  onClick={() => onSelectSegmentForCampaign(seg.id)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Campaña a este Segmento</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Crear Nuevo Segmento de Audiencia</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Segmento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Prospects WhatsApp de Alto Valor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  placeholder="Criterios del segmento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  rows={2}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Canales Incluidos</label>
                <div className="flex flex-wrap gap-2">
                  {(['whatsapp', 'instagram', 'twitter', 'messenger'] as SocialChannel[]).map(ch => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                        selectedChannels.includes(ch) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Score Mínimo de Lead IA ({minScore})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Guardar Segmento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
