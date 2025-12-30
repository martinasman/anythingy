import { jsonCompletion, textCompletion } from '@/lib/openrouter/client'
import type { AgentContext } from './types'
import type { WebsiteStructure, BusinessCanvas, MarketResearch, BrandColors } from '@/types'

const REACT_CODE_SYSTEM_PROMPT = `You are an expert React developer creating a beautiful, modern website component.

Generate a complete React App component that will be the main website. Use these requirements:

TECHNICAL REQUIREMENTS:
- Use React functional component with hooks if needed
- Use Tailwind CSS for ALL styling (no inline styles or CSS files)
- Use these custom Tailwind colors: primary, secondary, accent (configured in tailwind.config)
- Make it fully responsive (mobile-first)
- Add smooth hover transitions and animations
- Use semantic HTML elements

STRUCTURE:
- Export a default function component named "App"
- Include all sections in a single file (no imports except React)
- Use placeholder images from https://images.unsplash.com (use real unsplash URLs with w=800 parameter)

DESIGN PRINCIPLES:
- Modern, clean aesthetic with generous whitespace
- Clear visual hierarchy
- Consistent spacing using Tailwind's spacing scale
- Smooth hover effects on interactive elements
- Mobile-friendly navigation (hamburger menu on mobile)

SECTION PATTERNS:
For restaurants: Hero with food imagery, Menu sections with categories, Location/Hours, Gallery
For SaaS: Hero with demo CTA, Features grid, Pricing table, Testimonials, FAQ
For services: Hero with booking CTA, Services list, About, Testimonials, Contact form
For retail: Hero with featured products, Product grid, Categories, Reviews

OUTPUT:
Return ONLY the complete React component code. No markdown, no explanations.
Start directly with: export default function App() {`

const ARCHITECT_SYSTEM_PROMPT = `You are a website architect and UX designer. Your job is to design a complete website structure for a business.

Based on the business information, create a detailed website structure with content.

Return a JSON object with this exact structure:
{
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "sections": [
        {
          "id": "hero",
          "type": "hero",
          "content": {
            "headline": "string - main headline",
            "subheadline": "string - supporting text",
            "cta_primary": { "text": "string", "href": "string" },
            "cta_secondary": { "text": "string", "href": "string" }
          }
        }
      ]
    }
  ],
  "navigation": [
    { "label": "string", "href": "string" }
  ],
  "footer": {
    "company_name": "string",
    "tagline": "string",
    "links": [{ "label": "string", "href": "string" }],
    "social": [{ "platform": "twitter | linkedin | instagram | facebook", "url": "string" }]
  }
}

Section types available:

GENERAL SECTIONS (use for any business):
- hero: Main hero section with headline, subheadline, CTAs
- features: Feature grid with icon, title, description
- testimonials: Customer testimonials with quote, author, role
- pricing: Pricing tiers with name, price, features, CTA
- cta: Call-to-action banner
- faq: FAQ accordion with question/answer pairs
- contact: Contact form section
- about: About section with text content
- services: Services list with descriptions

BUSINESS-SPECIFIC SECTIONS (use when relevant):
- menu: For restaurants/food businesses. Categories with items, descriptions, and prices.
  Content: { categories: [{ name: "Kebabs", items: [{ name: "Chicken Kebab", description: "...", price: "$12.99" }] }] }
- gallery: Image gallery for showcasing work, food, products, etc.
  Content: { images: [{ alt: "description", caption: "optional caption" }] }
- location: Business location with address, hours, contact info.
  Content: { address: "123 Main St", phone: "+1...", hours: [{ day: "Mon-Fri", time: "9am-5pm" }] }
- products: E-commerce product grid with prices and add-to-cart buttons.
  Content: { products: [{ name: "Product", description: "...", price: "$29.99", badge: "New" }] }

BUSINESS TYPE DETECTION:
- Restaurant/Cafe/Food: Use hero, menu, gallery, location, testimonials, contact
- Retail/E-commerce: Use hero, products, features, testimonials, faq, contact
- Service Business: Use hero, services, about, testimonials, pricing, contact
- SaaS/Tech: Use hero, features, pricing, testimonials, faq, cta

Create at least 5 sections for the home page. Choose sections appropriate for the business type.
Headlines should be benefit-focused, not feature-focused.
CTAs should be specific and action-oriented.
For restaurants, include a realistic menu with at least 3 categories and 4+ items each.`

export async function runArchitect(ctx: AgentContext): Promise<{ website_structure: WebsiteStructure; website_code: string }> {
  const { business, previousOutputs, emit } = ctx
  const marketResearch = previousOutputs.market_research as MarketResearch
  const businessName = previousOutputs.business_name as string
  const tagline = previousOutputs.tagline as string
  const businessCanvas = previousOutputs.business_canvas as BusinessCanvas
  const brandColors = previousOutputs.brand_colors as BrandColors
  const brandVoice = previousOutputs.brand_voice as string

  emit({
    type: 'agent_progress',
    agent: 'architect',
    message: 'Designing website architecture...',
    progress: 0,
  })

  emit({
    type: 'agent_progress',
    agent: 'architect',
    message: 'Creating page layouts...',
    progress: 20,
  })

  const userPrompt = `
Business Name: ${businessName}
Tagline: ${tagline}
Business Idea: ${business.prompt}

Value Proposition: ${businessCanvas.value_proposition}
Problem: ${businessCanvas.problem}
Solution: ${businessCanvas.solution}

Target Audience: ${marketResearch.target_audience}

Revenue Streams:
${businessCanvas.revenue_streams.map((r) => `- ${r.name}: ${r.pricing} (${r.type})`).join('\n')}

Brand Voice: ${brandVoice}
Primary Color: ${brandColors.primary}

Key Features/Activities:
${businessCanvas.key_activities.map((a) => `- ${a}`).join('\n')}

Create a complete website structure that:
1. Clearly communicates the value proposition
2. Addresses the target audience's pain points
3. Guides visitors toward conversion
4. Reflects the brand voice
5. Includes realistic testimonials and FAQs`

  emit({
    type: 'agent_progress',
    agent: 'architect',
    message: 'Writing website content...',
    progress: 40,
  })

  // AI returns the raw structure, we need to wrap it
  const websiteStructure = await jsonCompletion<WebsiteStructure>(
    ARCHITECT_SYSTEM_PROMPT,
    userPrompt
  )

  emit({
    type: 'agent_progress',
    agent: 'architect',
    message: 'Generating React code...',
    progress: 60,
  })

  // Generate the actual React code for WebContainers
  const reactCodePrompt = `
Business Name: ${businessName}
Tagline: ${tagline}
Business Type: ${business.prompt}

Brand Colors:
- Primary: ${brandColors.primary}
- Secondary: ${brandColors.secondary}
- Accent: ${brandColors.accent}
- Background: ${brandColors.background}
- Text: ${brandColors.text}

Value Proposition: ${businessCanvas.value_proposition}
Target Audience: ${marketResearch.target_audience}

Website Sections to include:
${websiteStructure.pages[0]?.sections.map(s => `- ${s.type}: ${JSON.stringify(s.content)}`).join('\n')}

Navigation:
${websiteStructure.navigation.map(n => `- ${n.label}: ${n.href}`).join('\n')}

Footer Info:
- Company: ${websiteStructure.footer.company_name}
- Tagline: ${websiteStructure.footer.tagline}

Create a complete, production-ready React component with all these sections.
Use the brand colors via Tailwind classes (bg-primary, text-secondary, etc).
Make it visually stunning with modern design patterns.`

  const websiteCode = await textCompletion(
    REACT_CODE_SYSTEM_PROMPT,
    reactCodePrompt
  )

  emit({
    type: 'agent_progress',
    agent: 'architect',
    message: 'Website architecture complete!',
    progress: 100,
  })

  return { website_structure: websiteStructure, website_code: websiteCode }
}
