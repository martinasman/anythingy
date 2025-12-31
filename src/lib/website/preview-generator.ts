import type { Business, BrandColors, WebsitePage, NavigationItem, FooterSection } from '@/types'
import {
  heroTemplate,
  featuresTemplate,
  pricingTemplate,
  testimonialsTemplate,
  ctaTemplate,
  faqTemplate,
  contactTemplate,
  aboutTemplate,
  servicesTemplate,
  menuTemplate,
  galleryTemplate,
  locationTemplate,
  productsTemplate,
  footerTemplate,
  // New templates
  servicesPreviewTemplate,
  menuPreviewTemplate,
  pricingPreviewTemplate,
  teamTemplate,
  statsTemplate,
} from './templates'

/**
 * Generates a complete static HTML page from business data
 * Supports multipage rendering by accepting a currentPage slug
 */
export function generatePreviewHTML(
  business: Business,
  currentPageSlug: string = '/'
): string {
  const businessName = business.business_name || 'My Business'
  const businessTagline = business.tagline || 'Welcome to our business'
  const {
    brand_colors,
    website_structure,
  } = business

  const colors = brand_colors || {
    primary: '#1557F6',
    secondary: '#E5E7EB',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937',
  }

  // Get all pages and find the current one
  const pages = website_structure?.pages || []
  const currentPage = pages.find(p => p.slug === currentPageSlug) || pages[0]
  const navigation = website_structure?.navigation || []
  const footer = website_structure?.footer

  // Generate navigation HTML from actual pages
  const navHTML = generateNavigation(navigation, currentPageSlug, businessName)

  // Generate sections for current page only
  const sectionsHTML = currentPage
    ? generatePageSections(currentPage, colors)
    : heroTemplate({
        headline: 'Welcome',
        subheadline: 'Your business description goes here',
        cta_primary: { text: 'Get Started', href: '#contact' },
      })

  // Generate footer HTML
  const footerHTML = footer
    ? footerTemplate(footer)
    : generateDefaultFooter(businessName, businessTagline, colors)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(currentPage?.name || businessName)} - ${escapeHTML(businessName)}</title>
  <meta name="description" content="${escapeHTML((currentPage as any)?.description || businessTagline)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --background: ${colors.background || '#ffffff'};
      --text: ${colors.text || '#000000'};
    }

    /* Reset & Base */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }

    /* Layout */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .max-w-7xl { max-width: 80rem; }
    .max-w-6xl { max-width: 72rem; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-3xl { max-width: 48rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-md { max-width: 28rem; }

    /* Flexbox */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .flex-1 { flex: 1; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-12 { gap: 3rem; }

    /* Grid */
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

    /* Spacing */
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }

    /* Margins */
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-12 { margin-bottom: 3rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-12 { margin-top: 3rem; }
    .ml-4 { margin-left: 1rem; }
    .mr-4 { margin-right: 1rem; }

    /* Typography */
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-4xl { font-size: 2.25rem; }
    .text-5xl { font-size: 3rem; }
    .text-6xl { font-size: 3.75rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .italic { font-style: italic; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    /* Colors - use CSS variables */
    .text-white { color: white; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-900 { color: #111827; }
    .bg-white { background-color: white; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-gray-200 { background-color: #e5e7eb; }
    .bg-gray-900 { background-color: #111827; }

    /* Borders */
    .border { border-width: 1px; border-style: solid; }
    .border-2 { border-width: 2px; border-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
    .border-gray-200 { border-color: #e5e7eb; }
    .border-white { border-color: white; }
    .border-opacity-10 { --tw-border-opacity: 0.1; }
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-full { border-radius: 9999px; }

    /* Effects */
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

    /* Layout */
    .overflow-hidden { overflow: hidden; }
    .min-h-screen { min-height: 100vh; }
    .min-h-\\[80vh\\] { min-height: 80vh; }
    .h-12 { height: 3rem; }
    .h-48 { height: 12rem; }
    .h-64 { height: 16rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .w-12 { width: 3rem; }
    .w-14 { width: 3.5rem; }
    .h-14 { height: 3.5rem; }
    .w-24 { width: 6rem; }
    .h-24 { height: 6rem; }
    .w-32 { width: 8rem; }
    .h-32 { height: 8rem; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .inline-block { display: inline-block; }
    .inline-flex { display: inline-flex; }
    .block { display: block; }
    .hidden { display: none; }

    /* Positioning */
    .relative { position: relative; }
    .absolute { position: absolute; }
    .sticky { position: sticky; }
    .top-0 { top: 0; }
    .top-2 { top: 0.5rem; }
    .right-2 { right: 0.5rem; }
    .bottom-0 { bottom: 0; }
    .left-0 { left: 0; }
    .right-0 { right: 0; }
    .z-50 { z-index: 50; }

    /* Transitions */
    .transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }
    .transition-transform { transition-property: transform; transition-duration: 150ms; }
    .transition-shadow { transition-property: box-shadow; transition-duration: 150ms; }
    .transition-opacity { transition-property: opacity; transition-duration: 150ms; }

    /* Hover States */
    .hover\\:opacity-100:hover { opacity: 1; }
    .hover\\:text-gray-900:hover { color: #111827; }
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .hover\\:underline:hover { text-decoration: underline; }
    .hover\\:bg-gray-50:hover { background-color: #f9fafb; }

    /* Opacity */
    .opacity-0 { opacity: 0; }
    .opacity-75 { opacity: 0.75; }
    .opacity-90 { opacity: 0.9; }

    /* Spacing utilities */
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-12 > * + * { margin-top: 3rem; }

    /* Responsive - Mobile First */
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
      .md\\:text-2xl { font-size: 1.5rem; }
      .md\\:text-4xl { font-size: 2.25rem; }
      .md\\:text-5xl { font-size: 3rem; }
      .md\\:text-6xl { font-size: 3.75rem; }
      .md\\:flex-row { flex-direction: row; }
      .md\\:h-auto { height: auto; }
    }

    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
    }

    @media (min-width: 1280px) {
      .xl\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
    }

    /* Aspect ratios */
    .aspect-square { aspect-ratio: 1 / 1; }

    /* Details/Summary */
    details summary::-webkit-details-marker { display: none; }
    details summary { list-style: none; }
    .group:open .group-open\\:rotate-180 { transform: rotate(180deg); }

    /* Object fit */
    .object-cover { object-fit: cover; }

    /* Resize */
    .resize-none { resize: none; }

    /* Focus */
    .focus\\:outline-none:focus { outline: none; }

    /* Scale */
    .scale-105 { transform: scale(1.05); }

    /* Cursor */
    .cursor-pointer { cursor: pointer; }

    /* Active nav link */
    .nav-link-active {
      color: var(--primary) !important;
      font-weight: 600;
    }
  </style>
</head>
<body style="background: var(--background); color: var(--text)">
  ${navHTML}

  <!-- Main Content -->
  <main>
    ${sectionsHTML}
  </main>

  ${footerHTML}
</body>
</html>`
}

/**
 * Generate navigation HTML from website structure
 */
function generateNavigation(
  navigation: NavigationItem[],
  currentSlug: string,
  businessName: string
): string {
  if (navigation.length === 0) {
    // Default navigation
    navigation = [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '#features' },
      { label: 'Contact', href: '#contact' },
    ]
  }

  const navLinks = navigation.map(item => {
    const isActive = item.href === currentSlug
    return `<a href="${escapeHTML(item.href)}" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors ${isActive ? 'nav-link-active' : ''}">${escapeHTML(item.label)}</a>`
  }).join('\n        ')

  return `
  <!-- Navigation -->
  <nav class="sticky top-0 z-50 bg-white shadow-sm" style="border-bottom: 1px solid #e5e7eb">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="font-bold text-xl" style="color: var(--primary)">
        ${escapeHTML(businessName)}
      </a>
      <div class="flex items-center gap-6">
        ${navLinks}
      </div>
    </div>
  </nav>
`
}

/**
 * Generate sections for a specific page
 */
function generatePageSections(page: WebsitePage, colors: BrandColors): string {
  if (!page.sections || !Array.isArray(page.sections)) {
    return ''
  }

  return page.sections
    .map(section => generateSection(section, colors))
    .join('\n')
}

/**
 * Generate individual section HTML
 */
function generateSection(section: any, colors: BrandColors): string {
  const { type, content } = section

  if (!type) return ''

  // Handle case where content might not exist
  const sectionContent = content || {}

  switch (type) {
    case 'hero':
      return heroTemplate(sectionContent)
    case 'features':
      return featuresTemplate(sectionContent)
    case 'pricing':
      return pricingTemplate(sectionContent)
    case 'pricing_preview':
      return pricingPreviewTemplate(sectionContent)
    case 'testimonials':
      return testimonialsTemplate(sectionContent)
    case 'cta':
      return ctaTemplate(sectionContent)
    case 'faq':
      return faqTemplate(sectionContent)
    case 'contact':
      return contactTemplate(sectionContent)
    case 'about':
      return aboutTemplate(sectionContent)
    case 'services':
      return servicesTemplate(sectionContent)
    case 'services_preview':
      return servicesPreviewTemplate(sectionContent)
    case 'menu':
      return menuTemplate(sectionContent)
    case 'menu_preview':
      return menuPreviewTemplate(sectionContent)
    case 'gallery':
      return galleryTemplate(sectionContent)
    case 'location':
      return locationTemplate(sectionContent)
    case 'products':
      return productsTemplate(sectionContent)
    case 'team':
      return teamTemplate(sectionContent)
    case 'stats':
      return statsTemplate(sectionContent)
    default:
      console.warn(`Unknown section type: ${type}`)
      return ''
  }
}

/**
 * Generate default footer when no footer config exists
 */
function generateDefaultFooter(
  businessName: string,
  tagline: string,
  colors: BrandColors
): string {
  return `
  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12" style="background: var(--primary)">
    <div class="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div>
        <h3 class="font-bold mb-4">${escapeHTML(businessName)}</h3>
        <p class="text-sm opacity-75">${escapeHTML(tagline)}</p>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Product</h4>
        <ul class="space-y-2 text-sm opacity-75">
          <li><a href="#" class="hover:opacity-100">Features</a></li>
          <li><a href="#" class="hover:opacity-100">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Company</h4>
        <ul class="space-y-2 text-sm opacity-75">
          <li><a href="#" class="hover:opacity-100">About</a></li>
          <li><a href="#" class="hover:opacity-100">Blog</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-4">Legal</h4>
        <ul class="space-y-2 text-sm opacity-75">
          <li><a href="#" class="hover:opacity-100">Privacy</a></li>
          <li><a href="#" class="hover:opacity-100">Terms</a></li>
        </ul>
      </div>
    </div>
    <div class="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-white border-opacity-10 text-center text-sm opacity-75">
      <p>&copy; ${new Date().getFullYear()} ${escapeHTML(businessName)}. All rights reserved.</p>
    </div>
  </footer>
`
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHTML(text: string): string {
  if (typeof text !== 'string') return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Get all available pages from website structure
 */
export function getAvailablePages(business: Business): { name: string; slug: string }[] {
  const pages = business.website_structure?.pages || []
  return pages.map(p => ({ name: p.name, slug: p.slug }))
}
