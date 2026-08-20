export type SocialChannel = 'whatsapp' | 'instagram' | 'twitter' | 'messenger' | 'email';

export type LeadSentiment = 'positive' | 'neutral' | 'urgent' | 'churn_risk';

export type PipelineStage = 'lead' | 'qualified' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  phone?: string;
  email?: string;
  channel: SocialChannel;
  tags: string[];
  sentiment: LeadSentiment;
  leadScore: number; // 0 to 100
  stage: PipelineStage;
  dealValue: number;
  notes: string;
  lastActive: string;
  location?: string;
  company?: string;
  customFields?: Record<string, string>;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'contact' | 'agent' | 'bot';
  senderName?: string;
  text: string;
  timestamp: string;
  channel: SocialChannel;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  aiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  contactId: string;
  contact: Contact;
  channel: SocialChannel;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  status: 'open' | 'pending' | 'resolved';
  assignedAgent: string;
  summary?: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  channels: SocialChannel[];
  minScore?: number;
  tags?: string[];
  stages?: PipelineStage[];
  contactCount: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  channel: SocialChannel;
  segmentId: string;
  segmentName: string;
  content: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  sentCount: number;
  deliveredCount: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  conversions: number;
  scheduledDate?: string;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: 'message_received' | 'lead_created' | 'tag_added' | 'stage_changed';
  conditionChannel?: SocialChannel;
  conditionKeyword?: string;
  actions: {
    type: 'send_ai_reply' | 'add_tag' | 'change_stage' | 'call_webhook' | 'assign_agent';
    targetValue: string;
  }[];
  enabled: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  permissions: string[];
}

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  statusCode: number;
  payload: Record<string, any>;
  durationMs: number;
}

export interface AnalyticsData {
  totalConversations: number;
  avgResponseTimeMin: number;
  leadConversionRate: number;
  campaignRoi: number;
  channelBreakdown: { channel: SocialChannel; count: number; color: string }[];
  monthlyConversions: { month: string; leads: number; closed: number }[];
  sentimentBreakdown: { sentiment: string; count: number; color: string }[];
}
