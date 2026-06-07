import { ChatShell } from '../_components/ChatShell'
import { ChatInterface } from '../_components/ChatInterface'

const SUGGESTIONS = [
  'Find universities in Beijing with English programmes under $5,000/yr',
  'Compare total costs: Peking University, Fudan, and Wuhan University',
  'Which universities accept CSC scholarship applications?',
  'What documents do I need to apply to Tsinghua University?',
  'Best universities in China for Medicine or MBBS in English',
  'Show me low-cost universities in Sichuan or Chongqing',
  "How many days until Fudan's application deadline?",
]

export default function AgentPage() {
  return (
    <ChatShell
      title="AI Agent"
      subtitle="Your research tool for student consultations · University search · Cost comparison · Application guide"
      mode="agent"
    >
      <ChatInterface
        api="/api/agent"
        mode="agent"
        placeholder="Ask the agent to search universities, compare costs, or guide your application…"
        emptyHeading="University Education China Agent"
        emptyBody="Your research tool for student consultations. I can search our database of 90+ Chinese universities, compare costs, explain application steps, and look up live information."
        suggestions={SUGGESTIONS}
      />
    </ChatShell>
  )
}
