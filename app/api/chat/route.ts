import { streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { sql } from '../../_lib/db'

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json()

  // Save new user message before streaming
  if (conversationId) {
    const last = messages[messages.length - 1]
    if (last?.role === 'user') {
      const text: string =
        (last.parts ?? []).find((p: { type: string }) => p.type === 'text')
          ?.text ?? ''
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conversationId}, 'user', ${text})
      `.catch(console.error)
    }
  }

  const result = streamText({
    model: openai('gpt-4o'),
    system:
      'You are a helpful, concise, and friendly AI assistant. You have memory of the full conversation history and can refer back to anything said earlier.',
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (conversationId && text) {
        await sql`
          INSERT INTO messages (conversation_id, role, content)
          VALUES (${conversationId}, 'assistant', ${text})
        `.catch(console.error)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
