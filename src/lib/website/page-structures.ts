/**
 * Intelligent business-to-pages mapping
 * Defines appropriate page structures for different business types
 */

export interface PageConfig {
  name: string
  slug: string
  sections: string[]
  description?: string
}

export interface PageStructureConfig {
  pages: PageConfig[]
  requiredSections?: string[]
  primaryCTA?: string // Default CTA page (e.g., "/contact")
}

export const BUSINESS_PAGE_STRUCTURES: Record<string, PageStructureConfig> = {
  // Professional Services
  law_firm: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'testimonials', 'stats', 'cta'] },
      { name: 'Practice Areas', slug: '/practice-areas', sections: ['hero', 'services', 'cta'] },
      { name: 'Our Team', slug: '/team', sections: ['hero', 'team', 'about'] },
      { name: 'Case Results', slug: '/results', sections: ['hero', 'stats', 'testimonials'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    requiredSections: ['hero', 'services', 'contact'],
    primaryCTA: '/contact',
  },
  accounting: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'features', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing', 'cta'] },
      { name: 'About Us', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/contact',
  },
  consulting: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing'] },
      { name: 'Case Studies', slug: '/case-studies', sections: ['hero', 'testimonials', 'stats'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/contact',
  },

  // Food & Beverage
  restaurant: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'menu_preview', 'gallery', 'testimonials', 'location'] },
      { name: 'Menu', slug: '/menu', sections: ['hero', 'menu'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'gallery'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/menu',
  },
  cafe: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'menu_preview', 'gallery', 'testimonials'] },
      { name: 'Menu', slug: '/menu', sections: ['hero', 'menu'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/menu',
  },
  bakery: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'products', 'gallery', 'testimonials'] },
      { name: 'Our Products', slug: '/products', sections: ['hero', 'products'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'gallery'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/products',
  },

  // Technology
  saas: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'features', 'pricing_preview', 'testimonials', 'cta'] },
      { name: 'Features', slug: '/features', sections: ['hero', 'features', 'cta'] },
      { name: 'Pricing', slug: '/pricing', sections: ['hero', 'pricing', 'faq'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/pricing',
  },
  tech_startup: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'features', 'testimonials', 'stats', 'cta'] },
      { name: 'Product', slug: '/product', sections: ['hero', 'features', 'pricing'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/product',
  },
  agency: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'gallery', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing'] },
      { name: 'Portfolio', slug: '/portfolio', sections: ['hero', 'gallery'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/contact',
  },

  // Retail
  ecommerce: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'products', 'features', 'testimonials', 'cta'] },
      { name: 'Shop', slug: '/shop', sections: ['hero', 'products'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'faq'] },
    ],
    primaryCTA: '/shop',
  },
  retail: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'products', 'testimonials', 'location'] },
      { name: 'Products', slug: '/products', sections: ['hero', 'products'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'gallery'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/products',
  },

  // Health & Wellness
  gym: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'pricing_preview', 'testimonials', 'cta'] },
      { name: 'Classes', slug: '/classes', sections: ['hero', 'services', 'pricing'] },
      { name: 'Trainers', slug: '/trainers', sections: ['hero', 'team'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'gallery'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/classes',
  },
  spa: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'gallery', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/services',
  },
  salon: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'gallery', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing'] },
      { name: 'Gallery', slug: '/gallery', sections: ['hero', 'gallery'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/contact',
  },

  // Healthcare
  healthcare: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'team', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services'] },
      { name: 'Our Doctors', slug: '/doctors', sections: ['hero', 'team'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/contact',
  },
  dental: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'team', 'testimonials', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing'] },
      { name: 'Our Team', slug: '/team', sections: ['hero', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/contact',
  },

  // Real Estate
  real_estate: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'testimonials', 'stats', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services'] },
      { name: 'Listings', slug: '/listings', sections: ['hero', 'gallery'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/contact',
  },

  // Education
  school: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'features', 'testimonials', 'stats', 'cta'] },
      { name: 'Programs', slug: '/programs', sections: ['hero', 'services'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact', 'location'] },
    ],
    primaryCTA: '/programs',
  },
  tutoring: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services_preview', 'testimonials', 'pricing_preview', 'cta'] },
      { name: 'Services', slug: '/services', sections: ['hero', 'services', 'pricing'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about', 'team'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/contact',
  },

  // Default fallback
  default: {
    pages: [
      { name: 'Home', slug: '/', sections: ['hero', 'services', 'testimonials', 'cta'] },
      { name: 'About', slug: '/about', sections: ['hero', 'about'] },
      { name: 'Contact', slug: '/contact', sections: ['hero', 'contact'] },
    ],
    primaryCTA: '/contact',
  },
}

/**
 * Get appropriate page structure based on business type
 */
export function getPageStructure(businessType: string): PageStructureConfig {
  const normalized = businessType.toLowerCase().replace(/[\s-]/g, '_')

  // Direct match
  if (BUSINESS_PAGE_STRUCTURES[normalized]) {
    return BUSINESS_PAGE_STRUCTURES[normalized]
  }

  // Partial matches
  for (const [key, value] of Object.entries(BUSINESS_PAGE_STRUCTURES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  return BUSINESS_PAGE_STRUCTURES.default
}

/**
 * Business type categories for classification
 */
export const BUSINESS_CATEGORIES = {
  professional_services: ['law_firm', 'accounting', 'consulting', 'agency'],
  food_beverage: ['restaurant', 'cafe', 'bakery'],
  technology: ['saas', 'tech_startup', 'agency'],
  retail: ['ecommerce', 'retail'],
  health_wellness: ['gym', 'spa', 'salon'],
  healthcare: ['healthcare', 'dental'],
  real_estate: ['real_estate'],
  education: ['school', 'tutoring'],
} as const

/**
 * Get business type from prompt using keyword matching
 */
export function classifyBusinessType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  // Keyword to business type mapping
  const keywords: Record<string, string[]> = {
    law_firm: ['law', 'attorney', 'lawyer', 'legal', 'litigation', 'injury', 'criminal defense'],
    accounting: ['accounting', 'accountant', 'tax', 'bookkeeping', 'cpa', 'audit'],
    consulting: ['consulting', 'consultant', 'advisory', 'strategy'],
    restaurant: ['restaurant', 'dining', 'eatery', 'bistro', 'grill'],
    cafe: ['cafe', 'coffee', 'coffeehouse', 'espresso'],
    bakery: ['bakery', 'pastry', 'bread', 'cupcake', 'cake shop'],
    saas: ['saas', 'software', 'app', 'platform', 'tool', 'api'],
    tech_startup: ['startup', 'tech company', 'technology'],
    agency: ['agency', 'marketing', 'creative', 'design agency', 'advertising'],
    ecommerce: ['ecommerce', 'online store', 'shop online', 'dropshipping'],
    retail: ['retail', 'store', 'boutique', 'shop'],
    gym: ['gym', 'fitness', 'workout', 'training center', 'crossfit'],
    spa: ['spa', 'massage', 'wellness center', 'relaxation'],
    salon: ['salon', 'hair', 'beauty', 'barber', 'nails'],
    healthcare: ['clinic', 'medical', 'doctor', 'healthcare', 'hospital'],
    dental: ['dental', 'dentist', 'orthodontist', 'teeth'],
    real_estate: ['real estate', 'realtor', 'property', 'broker', 'homes'],
    school: ['school', 'academy', 'education', 'learning center'],
    tutoring: ['tutor', 'tutoring', 'lessons', 'coaching'],
  }

  for (const [businessType, typeKeywords] of Object.entries(keywords)) {
    for (const keyword of typeKeywords) {
      if (lowerPrompt.includes(keyword)) {
        return businessType
      }
    }
  }

  return 'default'
}
