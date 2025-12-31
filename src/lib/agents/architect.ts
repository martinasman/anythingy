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

const ARCHITECT_SYSTEM_PROMPT = `You are a website architect and UX designer. Your job is to design a COMPLETE MULTIPAGE website for a business.

## STEP 1: CLASSIFY THE BUSINESS TYPE
First, determine the business category:
- law_firm: Law firms, attorneys, legal services
- accounting: Accounting, tax, bookkeeping, CPA
- consulting: Business consulting, advisory, strategy
- restaurant: Restaurants, dining, food service
- cafe: Coffee shops, cafes
- bakery: Bakeries, pastry shops
- saas: Software as a Service, apps, platforms
- tech_startup: Technology startups
- agency: Marketing, creative, design agencies
- ecommerce: Online stores, e-commerce
- retail: Physical retail stores, boutiques
- gym: Gyms, fitness centers, training
- spa: Spas, wellness centers, massage
- salon: Hair salons, beauty, barber shops
- healthcare: Medical clinics, healthcare
- dental: Dental practices, orthodontists
- real_estate: Real estate, realtors, property

## STEP 2: GENERATE MULTIPLE PAGES (3-6 pages)
Based on the business type, generate the appropriate pages:

LAW FIRM PAGES:
- Home: Hero + services preview + testimonials + stats + CTA to /contact
- Practice Areas (/practice-areas): Full services list with details
- Our Team (/team): Attorney profiles with specializations
- Case Results (/results): Statistics and success stories
- Contact (/contact): Contact form + location

RESTAURANT PAGES:
- Home: Hero + menu preview + gallery + testimonials + location
- Menu (/menu): Full menu with categories
- About (/about): Story + gallery
- Contact (/contact): Contact form + hours + location

SAAS PAGES:
- Home: Hero + features preview + pricing preview + testimonials + CTA
- Features (/features): Detailed feature list
- Pricing (/pricing): Full pricing table + FAQ
- About (/about): Company story + team
- Contact (/contact): Contact form

## STEP 3: ENSURE CONTENT COHESION
- Hero CTAs MUST link to other pages (e.g., "View Our Services" → /services)
- Services preview on Home should say "View All Services →" linking to /services
- Testimonials should reference specific services
- Contact CTAs should appear on every page
- Navigation must include ALL pages

## JSON OUTPUT STRUCTURE
{
  "business_type": "the detected type (e.g., 'law_firm', 'restaurant', 'saas')",
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "description": "SEO meta description for this page",
      "sections": [
        {
          "id": "hero",
          "type": "hero",
          "content": {
            "headline": "benefit-focused headline",
            "subheadline": "supporting text",
            "cta_primary": { "text": "Primary CTA", "href": "/contact" },
            "cta_secondary": { "text": "Learn More", "href": "/services" }
          }
        }
      ]
    },
    {
      "name": "Services",
      "slug": "/services",
      "description": "SEO description",
      "sections": [...]
    }
  ],
  "navigation": [
    { "label": "Home", "href": "/" },
    { "label": "Services", "href": "/services" },
    { "label": "About", "href": "/about" },
    { "label": "Contact", "href": "/contact" }
  ],
  "footer": {
    "company_name": "Business Name",
    "tagline": "Tagline",
    "links": [{ "label": "Privacy", "href": "#" }],
    "social": [{ "platform": "linkedin", "url": "#" }]
  }
}

## SECTION TYPES AVAILABLE

GENERAL SECTIONS:
- hero: { headline, subheadline, cta_primary: {text, href}, cta_secondary: {text, href} }
- features: { headline, subheadline, features: [{icon, title, description}] }
- services: { headline, subheadline, services: [{name, description, price?}] }
- services_preview: Like services but with 3 items max and "View All →" link
- testimonials: { headline, testimonials: [{quote, author, role, company?}] }
- pricing: { headline, subheadline, tiers: [{name, price, period, features: [], cta, highlighted?}] }
- pricing_preview: Show 1-2 tiers with "See All Plans" link
- cta: { headline, subheadline, cta: {text, href} }
- faq: { headline, faqs: [{question, answer}] }
- contact: { headline, subheadline, email?, phone?, button_text }
- about: { headline, description, team?: [{name, role, bio?}] }
- team: { headline, members: [{name, title, bio, specialization?}] }
- stats: { stats: [{value: "500+", label: "Clients Served"}, {value: "$50M", label: "Recovered"}] }

BUSINESS-SPECIFIC:
- menu: { headline, categories: [{name, items: [{name, description, price}]}] }
- menu_preview: Show featured items with "View Full Menu →" link
- gallery: { headline, images: [{alt, caption?}] }
- location: { headline, address, phone, email, hours: [{day, time}] }
- products: { products: [{name, description, price, badge?}] }

## IMPORTANT RULES
1. Generate 3-6 pages appropriate for the business type
2. Every page MUST have a hero section
3. CTAs must link to actual pages (not "#")
4. Navigation must list ALL generated pages
5. Home page should preview content from other pages with "View More" links
6. Generate realistic, specific content (not placeholder text)
7. For restaurants: Include detailed menu with 3+ categories, 4+ items each
8. For law firms: Include specific practice areas and realistic case results`

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
