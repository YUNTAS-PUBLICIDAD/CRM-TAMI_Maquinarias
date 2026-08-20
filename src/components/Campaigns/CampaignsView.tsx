import React, { useState, useRef, useEffect } from 'react';
import { Campaign, Segment, SocialChannel, PresetImage } from '../../types';
import { INITIAL_PRESET_IMAGES } from '../../mockData';
import { 
  Send, Sparkles, Plus, Play, CheckCircle2, Clock, BarChart2, 
  Copy, RefreshCw, Zap, ThumbsUp, Image as ImageIcon, UploadCloud, 
  X, Trash2, Eye, Link as LinkIcon, FolderOpen, Check, AlertCircle,
  MessageSquare, Radio
} from 'lucide-react';

const LOCAL_STORAGE_PRESETS_KEY = 'xio_crm_preset_images_v1';

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
  const [imageUrl, setImageUrl] = useState<string>('');

  // Preset Images State with LocalStorage persistence
  const [presetImages, setPresetImages] = useState<PresetImage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRESETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRESET_IMAGES;
  });

  // Image Upload / Custom URL panel state
  const [isAddImagePanelOpen, setIsAddImagePanelOpen] = useState<boolean>(false);
  const [newImageName, setNewImageName] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [imageUploadError, setImageUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Copy Generation State
  const [isAiCopyLoading, setIsAiCopyLoading] = useState(false);
  const [aiVariations, setAiVariations] = useState<{ title: string; content: string }[] | null>(null);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);

  // Sync preset images with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(presetImages));
    } catch {
      // ignore
    }
  }, [presetImages]);

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
        if (resData.data.variations?.[0]?.content && !content) {
          setContent(resData.data.variations[0].content);
        }
      }
    } catch (err) {
      console.error('Error generating AI copy:', err);
    } finally {
      setIsAiCopyLoading(false);
    }
  };

  // Handle local file selection and convert to Base64 Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        const defaultName = file.name.replace(/\.[^/.]+$/, "");
        setNewImageUrl(result);
        if (!newImageName) {
          setNewImageName(defaultName);
        }
      }
    };
    reader.onerror = () => {
      setImageUploadError('Ocurrió un error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  // Save new uploaded image to gallery and select it for campaign
  const handleSaveAndApplyNewImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setImageUploadError('');

    const finalUrl = newImageUrl.trim();
    if (!finalUrl) {
      setImageUploadError('Debes subir un archivo o ingresar una URL de imagen válida.');
      return;
    }

    const newPreset: PresetImage = {
      id: `preset_${Date.now()}`,
      name: newImageName.trim() || 'Imagen de Campaña',
      url: finalUrl,
      type: 'Campaña / Banner'
    };

    const updatedPresets = [newPreset, ...presetImages];
    setPresetImages(updatedPresets);
    setImageUrl(finalUrl);

    // Reset and close panel
    setNewImageName('');
    setNewImageUrl('');
    setIsAddImagePanelOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveCampaign = (status: 'draft' | 'running') => {
    const targetSeg = segments.find(s => s.id === selectedSegmentId);
    onCreateCampaign({
      title: title || 'Nueva Campaña Omnicanal',
      channel,
      segmentId: selectedSegmentId,
      segmentName: targetSeg?.name || 'Segmento General',
      content: content || 'Contenido de la campaña.',
      imageUrl: imageUrl || undefined,
      status
    });

    setIsModalOpen(false);
    setTitle('');
    setOfferTopic('');
    setContent('');
    setImageUrl('');
    setAiVariations(null);
    setIsAddImagePanelOpen(false);
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
            Genera textos persuasivos con IA y transmite broadcasts con imágenes en WhatsApp, Instagram y X/Twitter.
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
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
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

                {/* Campaign Image if attached */}
                {camp.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 relative group">
                    <img 
                      src={camp.imageUrl} 
                      alt={camp.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-emerald-400" />
                      <span>Imagen Adjunta</span>
                    </div>
                  </div>
                )}

                {/* Message Preview */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono leading-relaxed">
                  "{camp.content}"
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Creador de Campañas Asistido por IA (Gemini 3.6)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Diseña textos masivos con IA y adjunta banners promocionales e imágenes.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Campaign Name & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de Campaña</label>
                  <input
                    type="text"
                    placeholder="Ej: Promo Descuento Módulo IA"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Canal de Difusión</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as SocialChannel)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="whatsapp">WhatsApp Broadcast</option>
                    <option value="instagram">Instagram DMs</option>
                    <option value="twitter">X / Twitter Direct</option>
                    <option value="messenger">Facebook Messenger</option>
                  </select>
                </div>
              </div>

              {/* Target Segment */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Segmento Objetivo de Audiencia</label>
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium"
                >
                  {segments.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.contactCount} Clientes)</option>
                  ))}
                </select>
              </div>

              {/* Step 1: AI Prompt Input */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>1. Indícale a la IA el producto o beneficio de la oferta:</span>
                  </label>
                </div>
                <textarea
                  placeholder="Ej: Ofrecemos 20% de descuento en el plan anual de Social CRM con automatización de WhatsApp e IA. Código: PLAN20."
                  value={offerTopic}
                  onChange={(e) => setOfferTopic(e.target.value)}
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleGenerateAiCopy}
                  disabled={isAiCopyLoading || !offerTopic.trim()}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  <Sparkles className={`w-4 h-4 text-yellow-300 ${isAiCopyLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiCopyLoading ? 'Generando variaciones con Gemini...' : '✨ Generar Variaciones de Textos con IA'}</span>
                </button>
              </div>

              {/* Step 2: AI Generated Variations Selection */}
              {aiVariations && aiVariations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="font-bold text-slate-800 flex items-center justify-between">
                    <span>2. Selecciona la variación preferida:</span>
                    <span className="text-[11px] text-indigo-600 font-normal">Haz clic para cargar en el mensaje final</span>
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

              {/* CUADRO PARA INSERTAR IMAGEN A LA CAMPAÑA (SOLICITADO POR EL USUARIO) */}
              <div className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        Imagen Adjunta a la Campaña (Opcional - Envía Imagen + Texto)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Inserta un banner, catálogo o foto de producto que acompañará el mensaje.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Quitar imagen</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAddImagePanelOpen(!isAddImagePanelOpen)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAddImagePanelOpen
                          ? 'bg-slate-800 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddImagePanelOpen ? 'Cerrar Subida' : '+ Subir / Ingresar Imagen'}</span>
                    </button>
                  </div>
                </div>

                {/* Subida o Ingreso de Nueva Imagen Form Panel */}
                {isAddImagePanelOpen && (
                  <div className="p-3.5 bg-white border border-emerald-300 rounded-xl space-y-3 shadow-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-emerald-600" />
                        <span>Subir Imagen desde Computadora o Pegar Enlace</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddImagePanelOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    {imageUploadError && (
                      <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{imageUploadError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          1. Subir archivo local (JPG, PNG, WebP)
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer bg-slate-50 p-1 border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          2. O pegar URL de imagen directa
                        </label>
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/banner-promo.jpg"
                          value={newImageUrl.startsWith('data:') ? '' : newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nombre o descripción de la imagen
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Banner Descuento 20%, Flyer Lanzamiento..."
                        value={newImageName}
                        onChange={(e) => setNewImageName(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {newImageUrl && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <img
                          src={newImageUrl}
                          alt="Vista previa carga"
                          referrerPolicy="no-referrer"
                          className="w-16 h-12 object-cover rounded border border-slate-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-800 block truncate">
                            {newImageName || 'Imagen seleccionada'}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            ✓ Lista para adjuntar a la campaña
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddImagePanelOpen(false)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAndApplyNewImage}
                        disabled={!newImageUrl}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Adjuntar a la Campaña</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Galería de Imágenes Disponibles */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Selecciona una imagen de la galería:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {presetImages.map((preset) => {
                      const isSelected = imageUrl === preset.url;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setImageUrl(preset.url)}
                          className={`p-1.5 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 truncate block px-0.5">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block px-0.5 truncate">
                            {preset.type || 'Galería'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 3: Selected Final Content */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Mensaje Final de la Campaña (Texto que recibirán los destinatarios)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="El texto seleccionado se cargará aquí para enviar..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Vista Previa del Mensaje de la Campaña (Live Preview) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Vista Previa del Broadcast ({channel.toUpperCase()}):</span>
                  </span>
                  {imageUrl && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Con Imagen Adjunta</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-[#efeae2]/80 rounded-2xl border border-slate-200 flex justify-end">
                  <div className="max-w-md w-full bg-[#dcf8c6] text-slate-900 rounded-2xl rounded-tr-xs p-3 text-xs shadow-xs border border-emerald-200/80 space-y-2">
                    {Boolean(imageUrl) && (
                      <div className="rounded-xl overflow-hidden border border-emerald-300/50 bg-black/5 shadow-2xs">
                        <img
                          key={imageUrl}
                          src={imageUrl}
                          alt="Imagen adjunta a la campaña"
                          referrerPolicy="no-referrer"
                          className="w-full max-h-52 object-cover block"
                        />
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-line text-slate-900 font-mono text-[11px]">
                      {content
                        ? content.replace(/{nombre}/g, 'Valeria Gómez').replace(/{empresa}/g, 'Innovatech')
                        : 'El mensaje de la campaña aparecerá aquí...'}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 pt-0.5">
                      <span>12:00</span>
                      <span className="text-emerald-700 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveCampaign('draft')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium cursor-pointer transition-colors"
                  >
                    Guardar Borrador
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveCampaign('running')}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Campaña Ahora</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
