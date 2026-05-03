import { ConversationScreen } from '@/components/messaging/conversation-screen';

export default function InboxConversationPage({ params }: { params: { conversationId: string } }) {
  return <ConversationScreen conversationId={params.conversationId} />;
}
