import React, { useState } from 'react';
import { 
  Contact, Conversation, Message, Segment, Campaign, AutomationRule, 
  ApiKey, WebhookConfig, WebhookLog, PipelineStage, SocialChannel 
} from './types';
import { 
  INITIAL_CONTACTS, INITIAL_CONVERSATIONS, INITIAL_MESSAGES, 
  INITIAL_SEGMENTS, INITIAL_CAMPAIGN, INITIAL_AUTOMATIONS, 
  INITIAL_API_KEYS, INITIAL_WEBHOOK, INITIAL_WEBHOOK_LOGS, INITIAL_ANALYTICS 
} from './mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InboxView } from './components/Inbox/InboxView';
import { ContactsView } from './components/Contacts/ContactsView';
import { SegmentsView } from './components/Segments/SegmentsView';
import { CampaignsView } from './components/Campaigns/CampaignsView';
import { AutomationView } from './components/Automation/AutomationView';
import { ApiGithubView } from './components/ApiGithub/ApiGithubView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { GithubModal } from './components/GithubModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core CRM Datasets State
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv_c1');

  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGN);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(INITIAL_WEBHOOK);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(INITIAL_WEBHOOK_LOGS);

  const [preselectedSegmentForCampaign, setPreselectedSegmentForCampaign] = useState<string | undefined>(undefined);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);

  // Unread Total Calculation
  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Handle Send Message
  const handleSendMessage = (conversationId: string, text: string, aiGenerated: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      conversationId,
      sender: 'agent',
      senderName: 'Asistente Whato CRM',
      text,
      timestamp,
      channel: conv.channel,
      status: 'sent',
      aiGenerated
    };

    // Update Messages Map
    setMessagesMap(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    // Update Conversation Last Message
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: 'Ahora',
          unreadCount: 0
        };
      }
      return c;
    }));
  };

  // Simulate Incoming Message from Social Channels & Trigger AI Auto-Responder
  const handleSimulateIncomingMessage = async () => {
    const randomChannel: SocialChannel = ['whatsapp', 'instagram', 'twitter'][Math.floor(Math.random() * 3)] as SocialChannel;
    const sampleQuestions = [
      "¡Hola! ¿Cómo instalo la extensión de Whato para WhatsApp Web y cuánto cuesta el plan anual?",
      "Buenas tardes, quisiera solicitar una demo ejecutiva para mi equipo de 10 asesores.",
      "Hola 👋 ¿Puedo conectar Google Calendar con Whato CRM para agendar reuniones desde el chat?"
    ];
    const questionText = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];

    const conv = conversations[0]; // Active conversation for simulation
    if (!conv) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const incomingMsg: Message = {
      id: `m_inc_${Date.now()}`,
      conversationId: conv.id,
      sender: 'contact',
      senderName: conv.contact.name,
      text: questionText,
      timestamp,
      channel: randomChannel,
      status: 'read'
    };

    // Update Messages Thread
    setMessagesMap(prev => ({
      ...prev,
      [conv.id]: [...(prev[conv.id] || []), incomingMsg]
    }));

    // Update Conversation State & Unread
    setConversations(prev => prev.map(c => {
      if (c.id === conv.id) {
        return {
          ...c,
          channel: randomChannel,
          lastMessage: questionText,
          lastMessageTime: timestamp,
          unreadCount: c.unreadCount + 1
        };
      }
      return c;
    }));

    // Automatically Call Server AI Chatbot Autorespond Endpoint!
    try {
      const response = await fetch('/api/ai/chatbot-autorespond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingMessage: questionText,
          channel: randomChannel,
          contactName: conv.contact.name,
          companyNotes: conv.contact.notes
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data?.botReply) {
        // Send AI Bot Auto Reply
        setTimeout(() => {
          handleSendMessage(conv.id, resData.data.botReply, true);
        }, 1200);
      }
    } catch (err) {
      console.error('Error in simulated bot response:', err);
    }
  };

  // Update Contact Stage
  const handleUpdateContactStage = (contactId: string, newStage: PipelineStage) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, stage: newStage } : c));
    setConversations(prev => prev.map(c => c.contactId === contactId ? { ...c, contact: { ...c.contact, stage: newStage } } : c));

    // Log Webhook event automatically
    const newLog: WebhookLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event: 'lead.stage_updated',
      statusCode: 200,
      payload: { contactId, newStage },
      durationMs: 85
    };
    setWebhookLogs(prev => [newLog, ...prev]);
  };

  // Update Contact Tags
  const handleUpdateContactTags = (contactId: string, newTags: string[]) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, tags: newTags } : c));
    setConversations(prev => prev.map(c => c.contactId === contactId ? { ...c, contact: { ...c.contact, tags: newTags } } : c));
  };

  // Update Contact Notes
  const handleUpdateContactNotes = (contactId: string, newNotes: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, notes: newNotes } : c));
    setConversations(prev => prev.map(c => c.contactId === contactId ? { ...c, contact: { ...c.contact, notes: newNotes } } : c));
  };

  // Add Contact
  const handleAddContact = (newContactData: Omit<Contact, 'id'>) => {
    const newId = `c_${Date.now()}`;
    const newContact: Contact = { ...newContactData, id: newId };
    setContacts(prev => [newContact, ...prev]);

    // Create a new conversation for this contact
    const newConvId = `conv_${newId}`;
    const newConv: Conversation = {
      id: newConvId,
      contactId: newId,
      contact: newContact,
      channel: newContact.channel,
      unreadCount: 0,
      lastMessage: 'Contacto registrado en el CRM Whato.',
      lastMessageTime: 'Ahora',
      status: 'open',
      assignedAgent: 'Asesor Whato'
    };

    setConversations(prev => [newConv, ...prev]);
    setMessagesMap(prev => ({
      ...prev,
      [newConvId]: [{
        id: `m_${Date.now()}`,
        conversationId: newConvId,
        sender: 'bot',
        senderName: 'Whato CRM Engine',
        text: `Lead registrado vía ${newContact.channel.toUpperCase()}. Score inicial de IA: ${newContact.leadScore}%`,
        timestamp: 'Ahora',
        channel: newContact.channel,
        status: 'read'
      }]
    }));
  };

  // Create Segment
  const handleCreateSegment = (newSegData: Omit<Segment, 'id' | 'createdAt' | 'contactCount'>) => {
    const newSeg: Segment = {
      ...newSegData,
      id: `seg_${Date.now()}`,
      contactCount: Math.floor(Math.random() * 150) + 50,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setSegments(prev => [...prev, newSeg]);
  };

  // Select Segment for Campaign
  const handleSelectSegmentForCampaign = (segmentId: string) => {
    setPreselectedSegmentForCampaign(segmentId);
    setActiveTab('campaigns');
  };

  // Create Campaign
  const handleCreateCampaign = (newCampData: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'openRate' | 'clickRate' | 'conversions'>) => {
    const newCamp: Campaign = {
      ...newCampData,
      id: `camp_${Date.now()}`,
      sentCount: 500,
      deliveredCount: 492,
      openRate: 82.5,
      clickRate: 31.0,
      conversions: 45,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setCampaigns(prev => [newCamp, ...prev]);
  };

  // Toggle Automation Rule
  const handleToggleRule = (ruleId: string) => {
    setAutomations(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // Simulate Rule Trigger
  const handleSimulateRuleTrigger = (ruleId: string) => {
    setAutomations(prev => prev.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          triggerCount: r.triggerCount + 1,
          lastTriggered: 'Hace un momento'
        };
      }
      return r;
    }));
  };

  // Select Conversation by Contact ID (used from Kanban cards)
  const handleSelectConversationByContactId = (contactId: string) => {
    const conv = conversations.find(c => c.contactId === contactId);
    if (conv) {
      setActiveConversationId(conv.id);
      setActiveTab('inbox');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadTotal={unreadTotal}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onSimulateIncomingMessage={handleSimulateIncomingMessage}
          onOpenGithubModal={() => setIsGithubModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Tab Views Switcher */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'inbox' && (
            <InboxView
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              messagesMap={messagesMap}
              onSendMessage={handleSendMessage}
              onUpdateContactStage={handleUpdateContactStage}
              onUpdateContactTags={handleUpdateContactTags}
              onUpdateContactNotes={handleUpdateContactNotes}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onUpdateStage={handleUpdateContactStage}
              onAddContact={handleAddContact}
              onSelectConversationByContactId={handleSelectConversationByContactId}
            />
          )}

          {activeTab === 'segments' && (
            <SegmentsView
              segments={segments}
              contacts={contacts}
              onCreateSegment={handleCreateSegment}
              onSelectSegmentForCampaign={handleSelectSegmentForCampaign}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsView
              campaigns={campaigns}
              segments={segments}
              onCreateCampaign={handleCreateCampaign}
              preselectedSegmentId={preselectedSegmentForCampaign}
            />
          )}

          {activeTab === 'automation' && (
            <AutomationView
              automations={automations}
              onToggleRule={handleToggleRule}
              onSimulateRuleTrigger={handleSimulateRuleTrigger}
            />
          )}

          {activeTab === 'api-github' && (
            <ApiGithubView
              apiKeys={apiKeys}
              webhookConfig={webhookConfig}
              webhookLogs={webhookLogs}
              onOpenGithubModal={() => setIsGithubModalOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView data={INITIAL_ANALYTICS} />
          )}
        </main>
      </div>

      {/* GitHub Export Modal */}
      <GithubModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />
    </div>
  );
}
