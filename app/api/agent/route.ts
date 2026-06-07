import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { sql } from '../../_lib/db'
import {
  UNIVERSITIES,
  filterUniversities,
  sortUniversities,
} from '../../_lib/universities'

// ─── Tool definitions ──────────────────────────────────────────────────────────

const tools = {
  // ── University search ──────────────────────────────────────────────────────
  search_universities: tool({
    description:
      'Search and filter Chinese universities from the ChinaUni database. Returns a summary list with key facts. Use this whenever the user asks about Chinese universities, programmes, costs, rankings, or scholarships.',
    inputSchema: z.object({
      query: z.string().optional().describe('Free-text search (name, city, programme, keyword)'),
      province: z.string().optional().describe('Filter by province, e.g. "Beijing", "Shanghai"'),
      type: z
        .enum(['research', 'comprehensive', 'technical', 'teacher-training', 'medical', 'language', 'agricultural', 'vocational'])
        .optional()
        .describe('University type'),
      hasCscScholarship: z.boolean().optional().describe('Only show CSC Government Scholarship universities'),
      hasEnglishPrograms: z.boolean().optional().describe('Only show universities with English-taught programmes'),
      ownership: z.enum(['public', 'private']).optional().describe('Public or private'),
      maxTuition: z.number().optional().describe('Maximum annual tuition in USD'),
      sortBy: z.enum(['qs-rank', 'national-rank', 'name', 'cost-low', 'cost-high']).optional(),
      limit: z.number().optional().describe('Max results to return (default 10)'),
    }),
    execute: async ({
      query,
      province,
      type,
      hasCscScholarship,
      hasEnglishPrograms,
      ownership,
      maxTuition,
      sortBy = 'qs-rank',
      limit = 10,
    }) => {
      const filtered = filterUniversities(UNIVERSITIES, {
        search: query ?? '',
        province: province ?? '',
        types: type ? [type] : [],
        ownership: ownership ?? 'all',
        cityCostLevel: 'all',
        minInternationalStudents: 0,
      })

      const sorted = sortUniversities(filtered, sortBy)
      const results = sorted
        .filter((u) => (maxTuition ? u.tuitionMin <= maxTuition : true))
        .slice(0, limit)

      return {
        total: sorted.length,
        showing: results.length,
        universities: results.map((u) => ({
          name: u.name,
          chineseName: u.chineseName,
          city: u.city,
          province: u.province,
          type: u.type,
          ownership: u.ownership,
          qsRanking: u.qsRanking ?? null,
          nationalRanking: u.nationalRanking ?? null,
          tuitionRange: `$${u.tuitionMin.toLocaleString()}–$${u.tuitionMax.toLocaleString()} USD/yr`,
          hostel: `$${u.hostelCostPerYear.toLocaleString()} USD/yr`,
          livingCost: `~$${u.livingCostPerMonth}/month`,
          cityCostLevel: u.cityCostLevel,
          hasCscScholarship: u.hasCscScholarship,
          hasEnglishPrograms: u.hasEnglishPrograms,
          hasOnlineApplication: u.hasOnlineApplication,
          internationalStudents: u.internationalStudents ?? null,
          strongPrograms: u.strongPrograms,
          applicationDeadline: u.applicationDeadline,
          website: u.website,
        })),
      }
    },
  }),

  // ── Cost comparison ────────────────────────────────────────────────────────
  compare_university_costs: tool({
    description:
      'Compare total annual study costs (tuition + hostel + living) for a list of universities. Great for budget planning.',
    inputSchema: z.object({
      universityNames: z
        .array(z.string())
        .describe('List of university names or partial names to compare'),
    }),
    execute: async ({ universityNames }) => {
      const matches = universityNames.map((name) => {
        const q = name.toLowerCase()
        const found = UNIVERSITIES.find(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.chineseName.includes(q) ||
            u.id === q.replace(/\s+/g, '-')
        )
        if (!found) return { query: name, found: false }
        const minTotal = found.tuitionMin + found.hostelCostPerYear + found.livingCostPerMonth * 12
        const maxTotal = found.tuitionMax + found.hostelCostPerYear + found.livingCostPerMonth * 12
        return {
          query: name,
          found: true,
          name: found.name,
          city: `${found.city}, ${found.province}`,
          tuition: `$${found.tuitionMin.toLocaleString()}–$${found.tuitionMax.toLocaleString()}/yr`,
          hostel: `$${found.hostelCostPerYear.toLocaleString()}/yr`,
          living: `~$${(found.livingCostPerMonth * 12).toLocaleString()}/yr ($${found.livingCostPerMonth}/mo)`,
          estimatedTotalMin: `$${minTotal.toLocaleString()}/yr`,
          estimatedTotalMax: `$${maxTotal.toLocaleString()}/yr`,
          cityCostLevel: found.cityCostLevel,
          hasCscScholarship: found.hasCscScholarship,
        }
      })
      return { comparisons: matches }
    },
  }),

  // ── Application guide ──────────────────────────────────────────────────────
  get_application_info: tool({
    description:
      'Get detailed application information for a specific university: deadlines, required documents, and application routes (university portal, CSC, CUCAS).',
    inputSchema: z.object({
      universityName: z.string().describe('University name or partial name'),
    }),
    execute: async ({ universityName }) => {
      const q = universityName.toLowerCase()
      const found = UNIVERSITIES.find(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.chineseName.includes(q)
      )
      if (!found) {
        return { error: `No university found matching "${universityName}"` }
      }
      return {
        name: found.name,
        chineseName: found.chineseName,
        applicationDeadline: found.applicationDeadline,
        applicationRoutes: found.applicationRoutes,
        requiredDocuments: found.requiredDocuments,
        admissionsWebsite: found.admissionsWebsite ?? found.website,
        hasCscScholarship: found.hasCscScholarship,
        hasOnlineApplication: found.hasOnlineApplication,
      }
    },
  }),

  // ── Datetime ───────────────────────────────────────────────────────────────
  get_current_datetime: tool({
    description: 'Returns the current UTC date and time.',
    inputSchema: z.object({}),
    execute: async (_: Record<string, never>) => ({
      datetime: new Date().toISOString(),
      timezone: 'UTC',
    }),
  }),

  // ── Weather ───────────────────────────────────────────────────────────────
  get_weather: tool({
    description: 'Returns simulated weather data for a given city.',
    inputSchema: z.object({
      city: z.string().describe('Name of the city'),
    }),
    execute: async ({ city }: { city: string }) => ({
      city,
      temperature_c: Math.round(10 + Math.random() * 25),
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly cloudy', 'Windy'][
        Math.floor(Math.random() * 5)
      ],
      humidity_pct: Math.round(40 + Math.random() * 50),
      note: 'Simulated data — swap with a real weather API for production.',
    }),
  }),

  // ── Web search ─────────────────────────────────────────────────────────────
  search_web: tool({
    description:
      'Searches the web via Tavily for information not in the university database (e.g. visa requirements, scholarship news, student forums).',
    inputSchema: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }: { query: string }) => {
      const key = process.env.TAVILY_API_KEY
      if (!key) {
        return {
          error:
            'Web search disabled — add TAVILY_API_KEY to .env.local to enable.',
        }
      }
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, query, max_results: 5 }),
      })
      const data = await res.json()
      return {
        results: (data.results ?? []).map(
          (r: { title: string; url: string; content: string }) => ({
            title: r.title,
            url: r.url,
            snippet: r.content?.slice(0, 300),
          })
        ),
      }
    },
  }),
}

// ─── Route handler ─────────────────────────────────────────────────────────────

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
    system: `You are ChinaUni Assistant — an expert AI agent helping international students find and apply to Chinese universities.

You have access to a database of ~80 Chinese universities with full details on costs, rankings, programmes, scholarships, and application requirements.

Your tools:
- search_universities — search and filter the university database
- compare_university_costs — compare total annual costs across universities
- get_application_info — get application deadlines, documents, and routes for a specific university
- get_current_datetime — get today's date (useful for deadline calculations)
- get_weather — check weather in a Chinese city (useful for relocation planning)
- search_web — search the internet for visa info, student reviews, scholarship news

Always use your tools to give accurate, data-driven answers. Be specific: quote rankings, costs, deadlines. If a user mentions a budget, use compare_university_costs or search_universities with maxTuition.`,
    messages: await convertToModelMessages(messages, { tools }),
    tools,
    stopWhen: stepCountIs(10),
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
