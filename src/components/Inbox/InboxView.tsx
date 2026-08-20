import React, { useState } from 'react';
import { 
  Conversation, Message, Contact, SocialChannel, LeadSentiment, PipelineStage 
} from '../../types';
import { 
  MessageSquare, Send, Sparkles, Phone, Mail, Tag, DollarSign, 
  TrendingUp, AlertCircle, CheckCircle, Clock, Bot, User, Filter,
  CheckCheck, Image, Paperclip, ChevronRight, FileText, RefreshCw, Zap,
  Chrome, Calendar, Mic, Check, Star, ExternalLink, HelpCircle
} from 'lucide-react';

interface InboxViewProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  messagesMap: Record<string, Message[]>;
  onSendMessage: (conversationId: string, text: string, aiGenerated?: boolean) => void;
  onUpdateContactStage: (contactId: string, newStage: PipelineStage) => void;
  onUpdateContactTags: (contactId: string, newTags: string[]) => void;
  onUpdateContactNotes: (contactId: string, newNotes: string) => void;
  searchQuery: string;
}

export const InboxView: React.FC<InboxViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  messagesMap,
  onSendMessage,
  onUpdateContactStage,
  onUpdateContactTags,
  onUpdateContactNotes,
  searchQuery
}) => {
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [inputText, setInputText] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');

  // Whato Extension Panel Toggle State
  const [showExtensionPanel, setShowExtensionPanel] = useState<boolean>(true);
  const [calendarDate, setCalendarDate] = useState<string>('2026-08-12');
  const [calendarTime, setCalendarTime] = useState<string>('15:00');
  const [calendarNotification, setCalendarNotification] = useState<string | null>(null);

  // AI Smart Reply State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ label: string; text: string }[] | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [detectedSentiment, setDetectedSentiment] = useState<LeadSentiment | null>(null);

  // AI Summary State
  const [summaryData, setSummaryData] = useState<{ summary: string; keyIntent: string; suggestedNextAction: string } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

  // Current active conversation
  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConv ? (messagesMap[activeConv.id] || []) : [];
  const contact = activeConv?.contact;

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    const matchesSearch = !searchQuery || 
      c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  // Handle Send
  const handleSend = () => {
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
    setAiSuggestions(null);
  };

  // Handle Send Voice Note Simulation
  const handleSendVoiceNote = () => {
    if (!activeConv) return;
    onSendMessage(activeConv.id, '🎙️ [Nota de Voz enviada via Whato CRM: 0:24]');
  };

  // Schedule Meeting in Google Calendar
  const handleScheduleGoogleCalendar = () => {
    if (!contact) return;
    setCalendarNotification(`¡Cita agendada en Google Calendar para ${contact.name} el ${calendarDate} a las ${calendarTime}!`);
    onSendMessage(activeConv.id, `📅 Hola ${contact.name}, he agendado nuestra reunión en Google Calendar para el ${calendarDate} a las ${calendarTime}. Te he enviado la invitación a tu correo.`);
    setTimeout(() => setCalendarNotification(null), 4000);
  };

  // Call Server-Side Gemini Smart Reply Endpoint
  const handleGenerateAiSmartReplies = async () => {
    if (!activeConv || !contact) return;
    setIsAiLoading(true);
    setAiSuggestions(null);

    try {
      const response = await fetch('/api/ai/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: activeMessages.map(m => ({ sender: m.sender, text: m.text })),
          contactName: contact.name,
          channel: contact.channel,
          stage: contact.stage
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiSuggestions(resData.data.suggestedReplies || []);
        setAiReasoning(resData.data.reasoning || '');
        if (resData.data.sentiment) {
          setDetectedSentiment(resData.data.sentiment);
        }
      }
    } catch (err) {
      console.error('Error generating AI Smart Replies:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Call Server-Side Gemini Summarize Endpoint
  const handleSummarizeConversation = async () => {
    if (!activeConv || !contact) return;
    setIsSummaryLoading(true);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: activeMessages.map(m => ({ sender: m.sender, text: m.text })),
          contactName: contact.name
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setSummaryData(resData.data);
      }
    } catch (err) {
      console.error('Error summarizing conversation:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Handle Tag Addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && contact) {
      if (!contact.tags.includes(tagInput.trim())) {
        onUpdateContactTags(contact.id, [...contact.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (contact) {
      onUpdateContactTags(contact.id, contact.tags.filter(t => t !== tagToRemove));
    }
  };

  // Get Channel Icon Badge
  const getChannelBadge = (ch: SocialChannel) => {
    switch (ch) {
      case 'whatsapp':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] flex items-center gap-1">WhatsApp</span>;
      case 'instagram':
        return <span className="px-2 py-0.5 bg-pink-100 text-pink-800 font-bold rounded text-[10px] flex items-center gap-1">Instagram</span>;
      case 'twitter':
        return <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-[10px] flex items-center gap-1">X / Twitter</span>;
      case 'messenger':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px] flex items-center gap-1">Messenger</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded text-[10px]">Email</span>;
    }
  };

  // Get Sentiment Badge
  const getSentimentBadge = (sentiment: LeadSentiment) => {
    switch (sentiment) {
      case 'positive':
        return <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full">Positivo</span>;
      case 'urgent':
        return <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full">Urgente</span>;
      case 'churn_risk':
        return <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-full">Riesgo Churn</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-full">Neutral</span>;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100">
      {/* COLUMN 1: Conversation List & Filters */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Channel Filter Tabs */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                channelFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Todos ({conversations.length})
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                channelFilter === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setChannelFilter('instagram')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                channelFilter === 'instagram' ? 'bg-pink-600 text-white' : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setChannelFilter('twitter')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                channelFilter === 'twitter' ? 'bg-sky-600 text-white' : 'text-sky-700 hover:bg-sky-50'
              }`}
            >
              X / Twitter
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay conversaciones en este filtro.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = activeConv && activeConv.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-emerald-50/90 border-l-4 border-emerald-600 shadow-2xs' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.contact.avatar}
                      alt={conv.contact.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5">
                      {getChannelBadge(conv.channel)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {conv.contact.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mb-1">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getSentimentBadge(conv.contact.sentiment)}
                      {conv.unreadCount > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Central WhatsApp Style Chat Canvas */}
      <div className="flex-1 flex flex-col bg-white min-w-0 border-r border-slate-200">
        {activeConv && contact ? (
          <>
            {/* Active Chat Header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{contact.name}</h3>
                    {getChannelBadge(contact.channel)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{contact.handle}</p>
                </div>
              </div>

              {/* Whato Extension & AI Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Whato Chrome Extension Panel Toggle */}
                <button
                  onClick={() => setShowExtensionPanel(!showExtensionPanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    showExtensionPanel ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Muestra u oculta la barra lateral de la Extensión Whato para WhatsApp Web"
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Extensión Whato</span>
                </button>

                {/* AI Summary Button */}
                <button
                  onClick={handleSummarizeConversation}
                  disabled={isSummaryLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isSummaryLoading ? 'Resumiendo...' : 'Resumen IA'}</span>
                </button>

                {/* AI Smart Replies Trigger */}
                <button
                  onClick={handleGenerateAiSmartReplies}
                  disabled={isAiLoading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>{isAiLoading ? 'Generando...' : 'Respuestas IA'}</span>
                </button>
              </div>
            </div>

            {/* Calendar Event Notification Toast */}
            {calendarNotification && (
              <div className="p-3 bg-emerald-100 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{calendarNotification}</span>
              </div>
            )}

            {/* AI Summary Banner (if loaded) */}
            {summaryData && (
              <div className="p-4 bg-emerald-50/80 border-b border-emerald-200 text-xs text-slate-800 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Resumen Ejecutivo IA (Whato + Gemini 3.6):</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{summaryData.summary}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                    <span><strong>Intención:</strong> {summaryData.keyIntent}</span>
                    <span><strong>Siguiente Paso:</strong> {summaryData.suggestedNextAction}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSummaryData(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* AI Suggestions Bar (if generated) */}
            {aiSuggestions && aiSuggestions.length > 0 && (
              <div className="p-3 bg-emerald-50/90 border-b border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Sugerencias Whato IA (Haz clic para enviar):
                  </span>
                  {aiReasoning && <span className="text-[11px] text-emerald-800 italic">{aiReasoning}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {aiSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(sug.text)}
                      className="p-2.5 bg-white hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-left text-xs transition-all shadow-2xs group cursor-pointer"
                    >
                      <div className="font-bold text-emerald-900 text-[11px] mb-0.5 group-hover:text-emerald-950">
                        {sug.label}
                      </div>
                      <p className="text-slate-700 text-[11px] line-clamp-2 font-sans">
                        "{sug.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Thread with WhatsApp Web Aesthetics */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#efeae2]/60 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
              {activeMessages.map((msg) => {
                const isAgent = msg.sender === 'agent' || msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-medium">
                      <span>{msg.senderName || (isAgent ? 'Agente Whato' : contact.name)}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {msg.aiGenerated && (
                        <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 font-bold rounded">
                          Bot IA
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isAgent
                          ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-xs border border-emerald-200/80'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Templates Bar & Composer */}
            <div className="p-3 border-t border-slate-200 bg-white space-y-2">
              {/* Quick Reply Shortcuts */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Respuestas Rápida:</span>
                <button 
                  onClick={() => setInputText(`¡Hola ${contact.name}! Gracias por comunicarte con nosotros vía Whato CRM. ¿En qué podemos asesorarte hoy?`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shrink-0 cursor-pointer"
                >
                  ⚡ Saludo WhatsApp
                </button>
                <button 
                  onClick={() => setInputText(`Hola ${contact.name}, los planes de Whato CRM inician en $15/mes e incluyen extensión para WhatsApp Web, Kanban y Chatbot IA.`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shrink-0 cursor-pointer"
                >
                  💰 Planes / Precios
                </button>
                <button 
                  onClick={() => setInputText(`Te adjunto el enlace para probar la Extensión Whato Web gratis por 3 días: https://whato.app/extension`)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium shrink-0 cursor-pointer"
                >
                  🧩 Link Extensión
                </button>
                <button 
                  onClick={handleSendVoiceNote}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3 h-3 text-emerald-600" />
                  <span>Enviar Nota de Voz</span>
                </button>
              </div>

              {/* Text Input Area */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Escribe un mensaje de WhatsApp para ${contact.name}...`}
                  rows={2}
                  className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none resize-none px-1"
                />

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Selecciona una conversación
          </div>
        )}
      </div>

      {/* COLUMN 3: Right Sidepanel (Whato Extension & Contact CRM Info) */}
      {contact && showExtensionPanel && (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Extension Header Banner */}
          <div className="p-4 border-b border-slate-200 bg-emerald-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Chrome className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs tracking-wide text-emerald-300">Extensión Whato CRM</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
              v3.4 Activa
            </span>
          </div>

          {/* Contact Avatar Header */}
          <div className="p-4 border-b border-slate-200 text-center bg-slate-50/50">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-emerald-200 shadow-2xs"
            />
            <h3 className="font-bold text-sm text-slate-900">{contact.name}</h3>
            <p className="text-xs text-slate-500 mb-2">{contact.company || 'Empresa no especificada'}</p>

            <div className="flex items-center justify-center gap-2">
              {getSentimentBadge(contact.sentiment)}
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full">
                Score IA: {contact.leadScore}/100
              </span>
            </div>
          </div>

          {/* Quick Schedule in Google Calendar */}
          <div className="p-4 border-b border-slate-200 space-y-2 bg-emerald-50/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agendar en Google Calendar</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="date"
                value={calendarDate}
                onChange={(e) => setCalendarDate(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="time"
                value={calendarTime}
                onChange={(e) => setCalendarTime(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={handleScheduleGoogleCalendar}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-2xs"
            >
              📅 Sincronizar Cita en Google Calendar
            </button>
          </div>

          {/* Pipeline Stage Selector */}
          <div className="p-4 border-b border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Etapa del Funnel (CRM Whato)
            </label>
            <select
              value={contact.stage}
              onChange={(e) => onUpdateContactStage(contact.id, e.target.value as PipelineStage)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="lead">📥 Prospecto Inicial (Lead)</option>
              <option value="qualified">🎯 Lead Cualificado</option>
              <option value="negotiation">💼 En Negociación / Cotización</option>
              <option value="closed_won">🎉 Venta Cerrada (Ganada)</option>
              <option value="closed_lost">❌ Perdida</option>
            </select>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Valor Estimado:</span>
              <span className="font-bold text-emerald-600">${contact.dealValue.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Tags Manager */}
          <div className="p-4 border-b border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Etiquetas WhatsApp
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {contact.tags.map(t => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold rounded-md flex items-center gap-1"
                >
                  {t}
                  <button 
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Agregar etiqueta + Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Contact Details */}
          <div className="p-4 border-b border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{contact.phone || 'Sin teléfono'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{contact.email || 'Sin correo'}</span>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="p-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Notas Rápidas (Extensión Whato)
            </label>
            <textarea
              value={contact.notes}
              onChange={(e) => onUpdateContactNotes(contact.id, e.target.value)}
              rows={4}
              placeholder="Guarda recordatorios sobre este cliente..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
