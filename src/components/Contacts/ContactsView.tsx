import React, { useState } from 'react';
import { Contact, PipelineStage, SocialChannel } from '../../types';
import { 
  Users, LayoutGrid, List, Plus, Search, Filter, DollarSign, 
  TrendingUp, Sparkles, ChevronRight, Phone, Mail, Tag, Trash2, Edit3,
  MessageSquare, Chrome
} from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onUpdateStage: (contactId: string, stage: PipelineStage) => void;
  onAddContact: (newContact: Omit<Contact, 'id'>) => void;
  onSelectConversationByContactId: (contactId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onUpdateStage,
  onAddContact,
  onSelectConversationByContactId
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    channel: 'whatsapp' as SocialChannel,
    dealValue: 1200,
    stage: 'lead' as PipelineStage,
    tags: 'WhatsApp, Lead Caliente',
    company: ''
  });

  const stages: { id: PipelineStage; label: string; color: string; bgColor: string }[] = [
    { id: 'lead', label: 'Prospectos Iniciales', color: 'border-slate-300', bgColor: 'bg-slate-100/80' },
    { id: 'qualified', label: 'Cualificados', color: 'border-blue-400', bgColor: 'bg-blue-50/70' },
    { id: 'negotiation', label: 'En Negociación', color: 'border-amber-400', bgColor: 'bg-amber-50/70' },
    { id: 'closed_won', label: 'Venta Ganada 🎉', color: 'border-emerald-500', bgColor: 'bg-emerald-50/80' },
    { id: 'closed_lost', label: 'Perdidos', color: 'border-rose-300', bgColor: 'bg-rose-50/50' }
  ];

  // Filter Contacts
  const filteredContacts = contacts.filter(c => {
    const matchesChannel = selectedChannel === 'all' || c.channel === selectedChannel;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  // Calculate Totals
  const totalPipelineValue = filteredContacts.reduce((acc, c) => acc + c.dealValue, 0);
  const totalWonValue = filteredContacts.filter(c => c.stage === 'closed_won').reduce((acc, c) => acc + c.dealValue, 0);

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    onAddContact({
      name: formData.name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      handle: formData.phone || formData.email || '@nuevo_lead',
      phone: formData.phone,
      email: formData.email,
      channel: formData.channel,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      sentiment: 'positive',
      leadScore: Math.floor(Math.random() * 30) + 65,
      stage: formData.stage,
      dealValue: Number(formData.dealValue) || 1200,
      notes: 'Contacto registrado en el CRM Whato.',
      lastActive: 'Ahora',
      company: formData.company || 'Empresa'
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      channel: 'whatsapp',
      dealValue: 1200,
      stage: 'lead',
      tags: 'WhatsApp, Lead Caliente',
      company: ''
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header / Stats */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Embudo de Ventas Kanban (Whato CRM)
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              {filteredContacts.length} Clientes Sincronizados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organiza tus prospectos capturados en WhatsApp Web, Instagram y X/Twitter.
          </p>
        </div>

        {/* Pipeline Totals & Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">TOTAL PIPELINE:</span>
              <span className="font-extrabold text-slate-900">${totalPipelineValue.toLocaleString()} USD</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">VENTAS GANADAS:</span>
              <span className="font-extrabold text-emerald-600">${totalWonValue.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente Whato</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, tag o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">Todos los Canales</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X / Twitter</option>
            <option value="messenger">Messenger</option>
          </select>
        </div>
      </div>

      {/* MAIN VIEW CONTENT */}
      <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
        {viewMode === 'kanban' ? (
          /* KANBAN BOARD */
          <div className="flex gap-4 min-w-[1100px] h-full items-start">
            {stages.map(stg => {
              const stageContacts = filteredContacts.filter(c => c.stage === stg.id);
              const stageTotal = stageContacts.reduce((acc, c) => acc + c.dealValue, 0);

              return (
                <div
                  key={stg.id}
                  className={`w-72 flex flex-col max-h-full rounded-xl border ${stg.color} ${stg.bgColor} p-3 shrink-0 shadow-2xs`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {stg.label}
                        <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                          {stageContacts.length}
                        </span>
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        ${stageTotal.toLocaleString()} USD
                      </p>
                    </div>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {stageContacts.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-lg bg-white/40">
                        Sin clientes en esta etapa
                      </div>
                    ) : (
                      stageContacts.map(contact => (
                        <div
                          key={contact.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  {contact.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-mono">{contact.phone || contact.handle}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-100">
                            <span className="text-emerald-600 font-extrabold">${contact.dealValue.toLocaleString()}</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                              Score: {contact.leadScore}%
                            </span>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 2).map(t => (
                              <span key={t} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Quick Stage Change Controls */}
                          <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100">
                            <button
                              onClick={() => onSelectConversationByContactId(contact.id)}
                              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp →</span>
                            </button>

                            <select
                              value={contact.stage}
                              onChange={(e) => onUpdateStage(contact.id, e.target.value as PipelineStage)}
                              className="text-[10px] p-1 bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                            >
                              <option value="lead">Mover a Prospecto</option>
                              <option value="qualified">Mover a Cualificado</option>
                              <option value="negotiation">Mover a Negociación</option>
                              <option value="closed_won">Mover a Ganada 🎉</option>
                              <option value="closed_lost">Mover a Perdida</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Canal</th>
                  <th className="p-3.5">Etapa Embudo</th>
                  <th className="p-3.5">Valor Deal</th>
                  <th className="p-3.5">Score IA</th>
                  <th className="p-3.5">Etiquetas</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-medium flex items-center gap-3">
                      <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{contact.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{contact.email || contact.phone}</div>
                      </div>
                    </td>
                    <td className="p-3.5 capitalize font-semibold">{contact.channel}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200">
                        {contact.stage}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600">${contact.dealValue.toLocaleString()}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600">{contact.leadScore}%</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectConversationByContactId(contact.id)}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Abrir WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW CONTACT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Cliente en Whato CRM</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Ramírez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Canal Origen</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as SocialChannel })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="messenger">Messenger</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor Estimado ($ USD)</label>
                  <input
                    type="number"
                    value={formData.dealValue}
                    onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+57 300 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Empresa</label>
                  <input
                    type="text"
                    placeholder="E-Commerce Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Etiquetas (Separadas por comas)</label>
                <input
                  type="text"
                  placeholder="WhatsApp, Lead Caliente, Cotización"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
