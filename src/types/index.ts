// ============ User Types ============

export interface User {
  id: string
  created_at: string
  email: string
  full_name: string | null
  avatar_url: string | null
  settings: Record<string, unknown>
}

// ============ Business Entity ============

export interface Business {
  id: string
  user_id: string | null
  created_at: string
  prompt: string
  slug: string | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  current_agent: string | null

  // Deployment
  deployed_url: string | null
  preview_url: string | null

  // Scout Agent Output
  market_research: MarketResearch | null

  // Strategist Agent Output
  business_name: string | null
  tagline: string | null
  business_canvas: BusinessCanvas | null

  // Artist Agent Output
  brand_colors: BrandColors | null
  logo_url: string | null
  brand_voice: string | null

  // Architect Agent Output
  website_structure: WebsiteStructure | null

  // Connector Agent Output
  customer_journey: CustomerJourney | null
  automation_flows: AutomationFlow[] | null
}

// ============ Business Config (Classification & Components) ============

export interface BusinessConfig {
  id: string
  business_id: string
  created_at: string

  // Classification
  primary_category: string | null
  secondary_categories: string[] | null
  confidence_score: number | null
  dimensions: ClassificationDimensions | null

  // Components
  components: ComponentRequirements | null

  // Template selection
  website_template: string | null
  dashboard_config: Record<string, unknown> | null
}

export interface ClassificationDimensions {
  industry_vertical: string | null
  product_or_service: 'product' | 'service' | 'both' | null
  customer_type: 'b2b' | 'b2c' | 'b2b2c' | null
  revenue_model: 'transaction' | 'subscription' | 'retainer' | 'hybrid' | null
  interaction_model: 'appointment' | 'class' | 'walk_in' | 'online' | 'hybrid' | null
  touch_level: 'high' | 'low' | 'medium' | null
}

export interface ComponentRequirements {
  booking: {
    enabled: boolean
    type: 'appointment' | 'class' | 'reservation' | 'service_window' | null
  }
  inventory: {
    enabled: boolean
    type: 'sku' | 'ingredient' | 'supplies' | null
  }
  crm: {
    enabled: boolean
    complexity: 'minimal' | 'standard' | 'high_touch'
  }
  payments: {
    enabled: boolean
    model: string | null
  }
  pos: {
    enabled: boolean
  }
  memberships: {
    enabled: boolean
  }
  documents: {
    enabled: boolean
  }
}

// ============ Offerings (Products/Services) ============

export interface Offering {
  id: string
  business_id: string
  created_at: string

  name: string
  description: string | null
  type: 'product' | 'service' | 'subscription' | 'package'

  // Pricing
  price: number | null // cents
  currency: string
  billing_period: string | null

  // Stripe integration
  stripe_product_id: string | null
  stripe_price_id: string | null
  checkout_url: string | null

  // Cal.com integration
  calcom_event_type_id: string | null
  booking_url: string | null
  duration_minutes: number | null

  // Metadata
  is_active: boolean
  sort_order: number
}

// ============ Integrations ============

export interface Integration {
  id: string
  business_id: string
  created_at: string

  provider: 'stripe' | 'calcom'
  account_id: string | null
  access_token: string | null
  refresh_token: string | null

  status: 'pending' | 'active' | 'revoked' | 'error'
  connected_at: string | null
  metadata: Record<string, unknown> | null
}

// ============ Customers ============

export interface Customer {
  id: string
  business_id: string
  created_at: string

  email: string
  name: string | null
  phone: string | null

  // CRM status
  status: 'lead' | 'contact' | 'deal' | 'customer' | 'churned'

  // External IDs
  stripe_customer_id: string | null

  // Source tracking
  source: 'stripe' | 'calcom' | 'form' | 'manual' | null
  source_details: Record<string, unknown> | null

  // CRM fields
  notes: string | null
  tags: string[] | null
  custom_fields: Record<string, unknown> | null

  // Metrics
  total_spent: number
  booking_count: number
  last_activity_at: string | null
}

// ============ Transactions ============

export interface Transaction {
  id: string
  business_id: string
  customer_id: string | null
  created_at: string

  type: 'income' | 'expense'
  category: string | null

  amount: number // cents
  currency: string

  description: string | null

  // Source tracking
  source: 'stripe' | 'manual' | null
  source_id: string | null

  occurred_at: string
}

// ============ Orders ============

export interface Order {
  id: string
  business_id: string
  customer_id: string | null
  created_at: string

  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded'

  // Stripe
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null

  // Totals
  subtotal: number | null
  tax: number
  total: number
  currency: string

  // Items
  items: OrderItem[] | null

  paid_at: string | null
  fulfilled_at: string | null
}

export interface OrderItem {
  offering_id: string
  name: string
  quantity: number
  unit_price: number
  total: number
}

// ============ Bookings ============

export interface Booking {
  id: string
  business_id: string
  customer_id: string | null
  offering_id: string | null
  created_at: string

  // Cal.com
  calcom_booking_uid: string | null

  // Schedule
  start_time: string
  end_time: string
  timezone: string | null

  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

  // Notes
  notes: string | null
  cancellation_reason: string | null
}

// ============ Analytics Events ============

export interface AnalyticsEvent {
  id: string
  business_id: string
  created_at: string

  event_type: string
  visitor_id: string | null

  page_path: string | null
  referrer: string | null
  user_agent: string | null
  ip_address: string | null

  properties: Record<string, unknown> | null
}

// ============ Webhook Events ============

export interface WebhookEvent {
  id: string
  created_at: string

  provider: 'stripe' | 'calcom'
  event_id: string
  event_type: string

  payload: Record<string, unknown> | null

  status: 'pending' | 'processing' | 'completed' | 'failed'
  processed_at: string | null
  error: string | null
}

// ============ Scout Agent Types ============

export interface MarketResearch {
  industry: string
  market_size: string
  growth_trend: string
  competitors: Competitor[]
  trends: string[]
  target_audience: string
  opportunities: string[]
  threats: string[]
}

export interface Competitor {
  name: string
  description: string
  url?: string
  strengths: string[]
  weaknesses: string[]
  pricing?: string
}

// ============ Strategist Agent Types ============

export interface BusinessCanvas {
  value_proposition: string
  problem: string
  solution: string
  customer_segments: string[]
  channels: string[]
  revenue_streams: RevenueStream[]
  key_resources: string[]
  key_activities: string[]
  key_partnerships: string[]
  cost_structure: CostItem[]
  unfair_advantage: string
}

export interface RevenueStream {
  name: string
  type: string
  pricing: string
  description: string
}

export interface CostItem {
  item: string
  type: 'fixed' | 'variable'
  amount: string
}

// ============ Artist Agent Types ============

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface BrandIdentity {
  colors: BrandColors
  logo_url: string | null
  voice: string
  personality: string[]
  typography: {
    heading: string
    body: string
  }
}

// ============ Architect Agent Types ============

export interface WebsiteStructure {
  pages: WebsitePage[]
  navigation: NavigationItem[]
  footer: FooterSection
}

export interface WebsitePage {
  name: string
  slug: string
  sections: PageSection[]
}

export interface PageSection {
  id: string
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'faq' | 'contact' | 'about' | 'services' | 'menu' | 'gallery' | 'location' | 'products'
  content: Record<string, unknown>
}

export interface NavigationItem {
  label: string
  href: string
}

export interface FooterSection {
  company_name: string
  tagline: string
  links: NavigationItem[]
  social: SocialLink[]
}

export interface SocialLink {
  platform: string
  url: string
}

// ============ Connector Agent Types ============

export interface CustomerJourney {
  stages: JourneyStage[]
}

export interface JourneyStage {
  name: string
  description: string
  touchpoints: string[]
  actions: string[]
  emotions: string
  kpis: string[]
}

export interface AutomationFlow {
  name: string
  description: string
  trigger: string
  steps: FlowStep[]
  tools: string[]
}

export interface FlowStep {
  action: string
  details: string
  delay?: string
}

// ============ SSE Event Types ============

export type SSEEventType =
  | 'agent_start'
  | 'agent_progress'
  | 'agent_complete'
  | 'agent_error'
  | 'generation_complete'

export interface SSEEvent {
  type: SSEEventType
  agent?: string
  message?: string
  data?: unknown
  progress?: number
}

// ============ Chat Types ============

export interface ChatMessage {
  id: string
  business_id: string
  created_at: string
  role: 'user' | 'assistant'
  content: string
  context?: {
    section?: string
    tab?: string
  }
}

export interface Attachment {
  id: string
  type: 'text' | 'image'
  content: string
  preview: string
}

export type ChatMode = 'chat' | 'edit'

// ============ Agent Types ============

export type AgentName = 'scout' | 'strategist' | 'artist' | 'architect' | 'connector'

export interface AgentRun {
  id: string
  business_id: string
  agent_name: AgentName
  started_at: string
  completed_at: string | null
  status: 'running' | 'completed' | 'failed'
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  error: string | null
}
