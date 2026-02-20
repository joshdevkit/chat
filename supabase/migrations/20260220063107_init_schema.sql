-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Conversation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  isGroup boolean NOT NULL DEFAULT false,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  createdById uuid NOT NULL,
  CONSTRAINT Conversation_pkey PRIMARY KEY (id),
  CONSTRAINT Conversation_createdById_fkey FOREIGN KEY (createdById) REFERENCES public.User(id)
);

CREATE TABLE public.ConversationHide (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversationId uuid NOT NULL,
  userId uuid NOT NULL,
  hiddenAt timestamp with time zone NOT NULL DEFAULT now(),
  visibleFrom timestamp with time zone,
  CONSTRAINT ConversationHide_pkey PRIMARY KEY (id),
  CONSTRAINT ConversationHide_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES public.Conversation(id),
  CONSTRAINT ConversationHide_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);

CREATE TABLE public.ConversationTheme (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversationId uuid NOT NULL UNIQUE,
  bgColor text,
  textColor text,
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ConversationTheme_pkey PRIMARY KEY (id),
  CONSTRAINT ConversationTheme_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES public.Conversation(id)
);

CREATE TABLE public.Message (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversationId uuid NOT NULL,
  senderId uuid NOT NULL,
  content text,
  type USER-DEFINED NOT NULL DEFAULT 'TEXT'::"MessageType",
  fileUrl text,
  fileName text,
  fileSize integer,
  groupId uuid,
  deletedAt timestamp with time zone,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Message_pkey PRIMARY KEY (id),
  CONSTRAINT Message_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES public.Conversation(id),
  CONSTRAINT Message_senderId_fkey FOREIGN KEY (senderId) REFERENCES public.User(id)
);

CREATE TABLE public.MessageHide (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  messageId uuid NOT NULL,
  userId uuid NOT NULL,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT MessageHide_pkey PRIMARY KEY (id),
  CONSTRAINT MessageHide_messageId_fkey FOREIGN KEY (messageId) REFERENCES public.Message(id),
  CONSTRAINT MessageHide_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);

CREATE TABLE public.MessageReaction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  messageId uuid NOT NULL,
  userId uuid NOT NULL,
  emoji text NOT NULL,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT MessageReaction_pkey PRIMARY KEY (id),
  CONSTRAINT MessageReaction_messageId_fkey FOREIGN KEY (messageId) REFERENCES public.Message(id),
  CONSTRAINT MessageReaction_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);

CREATE TABLE public.MessageRead (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  messageId uuid NOT NULL,
  userId uuid NOT NULL,
  readAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT MessageRead_pkey PRIMARY KEY (id),
  CONSTRAINT MessageRead_messageId_fkey FOREIGN KEY (messageId) REFERENCES public.Message(id),
  CONSTRAINT MessageRead_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);

CREATE TABLE public.Participant (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversationId uuid NOT NULL,
  userId uuid NOT NULL,
  joinedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Participant_pkey PRIMARY KEY (id),
  CONSTRAINT Participant_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES public.Conversation(id),
  CONSTRAINT Participant_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);

CREATE TABLE public.TypingStatus (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversationId uuid NOT NULL,
  userId uuid NOT NULL,
  expiresAt timestamp with time zone NOT NULL,
  CONSTRAINT TypingStatus_pkey PRIMARY KEY (id),
  CONSTRAINT TypingStatus_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES public.Conversation(id),
  CONSTRAINT TypingStatus_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);

CREATE TABLE public.User (
  id uuid NOT NULL,
  fullName text NOT NULL,
  email text NOT NULL UNIQUE,
  lastSeenAt timestamp with time zone,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT User_pkey PRIMARY KEY (id),
  CONSTRAINT User_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.UserProfile (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  userId uuid NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  bio text,
  dateOfBirth timestamp with time zone,
  avatarUrl text,
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT UserProfile_pkey PRIMARY KEY (id),
  CONSTRAINT UserProfile_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id)
);