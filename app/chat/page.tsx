import { ChatShell } from '../_components/ChatShell'
import { ChatInterface } from '../_components/ChatInterface'

const SUGGESTIONS = [
  'What is the HSK and which level do I need?',
  'Explain the CSC Government Scholarship',
  'What is student life like in Beijing vs Shanghai?',
  'How do I apply for a Chinese student visa (X1/X2)?',
]

export default function ChatPage() {
  return (
    <ChatShell
      title="AI Chat"
      subtitle="Powered by GPT-4o · History persisted"
    >
      <ChatInterface
        api="/api/chat"
        mode="chat"
        placeholder="Ask me anything…"
        emptyHeading="Start a conversation"
        emptyBody="Ask me anything about studying in China — visas, language, scholarships, student life."
        suggestions={SUGGESTIONS}
      />
    </ChatShell>
  )
}
