// Chat and messaging types for the Claude Code IDE

export interface ChatMessage {
  id: string;
  conversationId: string;
  type: ChatMessageType;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  status: ChatMessageStatus;
  metadata: ChatMessageMetadata;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  thread?: ChatThread;
  edited?: {
    at: Date;
    by: string;
    originalContent: string;
  };
}

export type ChatMessageType = 
  | 'text'
  | 'code'
  | 'file'
  | 'image'
  | 'system'
  | 'command'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export type ChatMessageRole = 
  | 'user'
  | 'assistant'
  | 'system'
  | 'agent';

export type ChatMessageStatus = 
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled';

export interface ChatMessageMetadata {
  agentId?: string;
  agentName?: string;
  taskId?: string;
  executionTime?: number;
  tokenCount?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, any>;
  tools?: string[];
  reasoning?: string;
  confidence?: number;
}

export interface ChatAttachment {
  id: string;
  type: 'file' | 'image' | 'code' | 'link' | 'document';
  name: string;
  url?: string;
  content?: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
  preview?: string;
}

export interface ChatReaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface ChatThread {
  id: string;
  parentMessageId: string;
  messages: ChatMessage[];
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatConversation {
  id: string;
  title: string;
  type: ChatConversationType;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  settings: ChatConversationSettings;
  status: ChatConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  metadata: Record<string, any>;
}

export type ChatConversationType = 
  | 'direct'
  | 'group'
  | 'agent'
  | 'system'
  | 'debug';

export type ChatConversationStatus = 
  | 'active'
  | 'archived'
  | 'deleted'
  | 'muted';

export interface ChatParticipant {
  id: string;
  name: string;
  type: 'user' | 'agent' | 'system';
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  permissions: ChatPermission[];
  joinedAt: Date;
  lastSeenAt?: Date;
}

export interface ChatPermission {
  action: 'send_message' | 'edit_message' | 'delete_message' | 'add_participant' | 'remove_participant' | 'manage_settings';
  allowed: boolean;
}

export interface ChatConversationSettings {
  allowEditing: boolean;
  allowDeletion: boolean;
  allowReactions: boolean;
  allowThreads: boolean;
  autoSave: boolean;
  retentionDays?: number;
  maxMessageLength?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  notifications: {
    mentions: boolean;
    allMessages: boolean;
    keywords: string[];
  };
}

export interface ChatCommand {
  name: string;
  description: string;
  syntax: string;
  parameters: ChatCommandParameter[];
  examples: string[];
  permissions: string[];
  handler: (args: string[], context: ChatCommandContext) => Promise<ChatCommandResult>;
}

export interface ChatCommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'user' | 'agent';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface ChatCommandContext {
  conversationId: string;
  userId: string;
  messageId: string;
  currentWorkspace?: string;
  selectedFiles?: string[];
  environment: Record<string, any>;
}

export interface ChatCommandResult {
  success: boolean;
  message?: string;
  data?: any;
  attachments?: ChatAttachment[];
  followUpActions?: ChatFollowUpAction[];
}

export interface ChatFollowUpAction {
  type: 'button' | 'link' | 'command';
  label: string;
  action: string;
  data?: any;
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export interface ChatTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: ChatTemplateVariable[];
  tags: string[];
  usage: number;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatTemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'selection';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
}

export interface ChatQuickAction {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  category: string;
  description: string;
  action: (context: ChatQuickActionContext) => Promise<ChatQuickActionResult>;
}

export interface ChatQuickActionContext {
  selectedText?: string;
  selectedFiles?: string[];
  currentFile?: string;
  conversation: ChatConversation;
  message?: ChatMessage;
}

export interface ChatQuickActionResult {
  message?: string;
  command?: string;
  files?: { path: string; content: string }[];
  openFiles?: string[];
  navigateTo?: string;
}

export interface ChatTypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: Date;
}

export interface ChatNotification {
  id: string;
  type: 'mention' | 'message' | 'system' | 'error';
  title: string;
  content: string;
  conversationId: string;
  messageId?: string;
  timestamp: Date;
  read: boolean;
  actions?: ChatNotificationAction[];
}

export interface ChatNotificationAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary';
}

export interface ChatSearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  highlights: { start: number; end: number }[];
  timestamp: Date;
  author: string;
  context: {
    before: string;
    after: string;
  };
}

export interface ChatSearchOptions {
  query: string;
  conversationIds?: string[];
  authorIds?: string[];
  messageTypes?: ChatMessageType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeContent?: boolean;
  includeAttachments?: boolean;
  maxResults?: number;
  sortBy?: 'relevance' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface ChatContext {
  conversations: ChatConversation[];
  activeConversationId?: string;
  currentUser: ChatParticipant;
  typingIndicators: ChatTypingIndicator[];
  notifications: ChatNotification[];
  commands: ChatCommand[];
  templates: ChatTemplate[];
  quickActions: ChatQuickAction[];
  
  // Conversation management
  createConversation: (config: Partial<ChatConversation>) => Promise<ChatConversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  updateConversationSettings: (conversationId: string, settings: Partial<ChatConversationSettings>) => Promise<void>;
  addParticipant: (conversationId: string, participant: ChatParticipant) => Promise<void>;
  removeParticipant: (conversationId: string, participantId: string) => Promise<void>;
  
  // Message management
  sendMessage: (conversationId: string, content: string, type?: ChatMessageType, metadata?: Partial<ChatMessageMetadata>) => Promise<ChatMessage>;
  editMessage: (messageId: string, content: string) => Promise<ChatMessage>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, reactionId: string) => Promise<void>;
  
  // File operations
  uploadFile: (file: File, conversationId: string) => Promise<ChatAttachment>;
  shareFiles: (paths: string[], conversationId: string) => Promise<ChatMessage>;
  
  // Command system
  executeCommand: (command: string, args: string[], context: ChatCommandContext) => Promise<ChatCommandResult>;
  registerCommand: (command: ChatCommand) => void;
  unregisterCommand: (commandName: string) => void;
  
  // Templates
  applyTemplate: (templateId: string, variables: Record<string, any>, conversationId: string) => Promise<ChatMessage>;
  createTemplate: (template: Omit<ChatTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usage'>) => Promise<ChatTemplate>;
  updateTemplate: (templateId: string, updates: Partial<ChatTemplate>) => Promise<ChatTemplate>;
  deleteTemplate: (templateId: string) => Promise<void>;
  
  // Search
  searchMessages: (options: ChatSearchOptions) => Promise<ChatSearchResult[]>;
  
  // Real-time updates
  subscribeToConversation: (conversationId: string, callback: (message: ChatMessage) => void) => () => void;
  subscribeToTyping: (conversationId: string, callback: (indicator: ChatTypingIndicator) => void) => () => void;
  subscribeToNotifications: (callback: (notification: ChatNotification) => void) => () => void;
  
  // Status management
  setTyping: (conversationId: string, isTyping: boolean) => void;
  setUserStatus: (status: ChatParticipant['status']) => void;
  markAsRead: (conversationId: string, messageId?: string) => void;
  
  // Export/Import
  exportConversation: (conversationId: string, format: 'json' | 'markdown' | 'html') => Promise<string>;
  importConversation: (data: string, format: 'json') => Promise<ChatConversation>;
}