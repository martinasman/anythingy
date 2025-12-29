import { tavily } from '@tavily/core'
import { jsonCompletion } from '@/lib/openrouter/client'
import type { AgentContext } from './types'
import type { MarketResearch } from '@/types'

const SCOUT_SYSTEM_PROMPT = `You are a market research analyst. Your job is to analyze market data and provide comprehensive insights about a business idea.

Based on the search results provided, create a detailed market analysis.

Return a JSON object with this exact structure:
{
  "industry": "string - the industry name",
  "market_size": "string - estimated market size",
  "growth_trend": "string - growth trend description",
  "competitors": [
    {
      "name": "string",
      "description": "string",
      "url": "string or null",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "pricing": "string or null"
    }
  ],
  "trends": ["string - current market trends"],
  "target_audience": "string - description of ideal customers",
  "opportunities": ["string - market opportunities"],
  "threats": ["string - market threats"]
}

Be specific and data-driven. Include at least 3 competitors, 3 trends, 3 opportunities, and 2 threats.`

export async function runScout(ctx: AgentContext): Promise<MarketResearch> {
  const { business, emit } = ctx

  emit({
    type: 'agent_progress',
    agent: 'scout',
    message: 'Starting market research...',
    progress: 0,
  })

  let searchResults = {
    industry: [] as string[],
    competitors: [] as string[],
  }

  // Try Tavily search if API key is available
  if (process.env.TAVILY_API_KEY) {
    try {
      emit({
        type: 'agent_progress',
        agent: 'scout',
        message: 'Searching for industry trends...',
        progress: 20,
      })

      const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY })

      // Search for industry information
      const industrySearch = await tavilyClient.search(
        `${business.prompt} industry trends market analysis 2025`,
        { maxResults: 5 }
      )

      searchResults.industry = industrySearch.results.map(
        (r) => `${r.title}: ${r.content}`
      )

      emit({
        type: 'agent_progress',
        agent: 'scout',
        message: 'Identifying competitors...',
        progress: 40,
      })

      // Search for competitors
      const competitorSearch = await tavilyClient.search(
        `${business.prompt} competitors companies startups`,
        { maxResults: 5 }
      )

      searchResults.competitors = competitorSearch.results.map(
        (r) => `${r.title}: ${r.content}`
      )
    } catch (error) {
      console.error('Tavily search failed:', error)
      // Continue without search results
    }
  }

  emit({
    type: 'agent_progress',
    agent: 'scout',
    message: 'Analyzing market data...',
    progress: 60,
  })

  // Generate market research using LLM
  const userPrompt = `
Business Idea: ${business.prompt}

${searchResults.industry.length > 0 ? `Industry Research Data:
${searchResults.industry.join('\n\n')}` : ''}

${searchResults.competitors.length > 0 ? `Competitor Research Data:
${searchResults.competitors.join('\n\n')}` : ''}

${searchResults.industry.length === 0 && searchResults.competitors.length === 0
  ? 'Note: No search data available. Please generate realistic market research based on your knowledge of this industry.'
  : ''}

Create a comprehensive market analysis for this business idea.`

  const result = await jsonCompletion<MarketResearch>(
    SCOUT_SYSTEM_PROMPT,
    userPrompt
  )

  emit({
    type: 'agent_progress',
    agent: 'scout',
    message: 'Market research complete!',
    progress: 100,
  })

  return result
}
