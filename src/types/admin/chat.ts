export interface ILatestMessage {
  id: number;
  message: string | null;
  message_type: string;
  file_name: string | null;
  file_type: string | null;
  file_category: string | null;
  user_id: number;
  user_name: string;
  created_at: string;
}

export interface IConversation {
  type: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  unread_count: number;
  latest_message: ILatestMessage | null;
  last_activity: string | null;
}

export interface IConversationPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  total_unread_count: number;
}

export interface IConversationsResponse {
  data: {
    conversations: IConversation[];
    pagination: IConversationPagination;
  };
}

export interface IReplyToMessage {
  id: number;
  user_id: number;
  user_name: string;
  message: string | null;
  message_type: string;
  created_at: string;
}

export interface IChatMessage {
  id: number;
  message: string | null;
  user_id: number;
  sender_name: string;
  sender_avatar: string | null;
  receiver_id: number;
  receiver_name: string;
  receiver_avatar: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  chat_type: string;
  reply_to_message_id: number | null;
  reply_to_message: IReplyToMessage | null;
  created_at: string;
}

export interface IChatHistoryResponse {
  data: {
    messages: IChatMessage[];
    unread_count: number;
    pagination: IConversationPagination;
  };
}

export interface ISendMessageResponse {
  data: IChatMessage;
}
