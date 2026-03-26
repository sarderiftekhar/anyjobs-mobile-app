export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  text: string;
  type: "text" | "file" | "system";
  file_url?: string;
  read: boolean;
  sent_at: string;
}

export interface Conversation {
  id: number;
  participant: {
    id: number;
    name: string;
    avatar_url?: string;
    user_type: string;
  };
  job_title?: string;
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}
