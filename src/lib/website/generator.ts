import type { WebsiteStructure, BrandColors, PageSection } from '@/types'
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
} from './templates'

const sectionTemplates: Record<string, (content: Record<string, unknown>) => string> = {
  hero: heroTemplate,
  features: featuresTemplate,
  pricing: pricingTemplate,
  testimonials: testimonialsTemplate,
  cta: ctaTemplate,
  faq: faqTemplate,
  contact: contactTemplate,
  about: aboutTemplate,
  services: servicesTemplate,
  menu: menuTemplate,
  gallery: galleryTemplate,
  location: locationTemplate,
  products: productsTemplate,
}

function generateSection(section: PageSection): string {
  const template = sectionTemplates[section.type]
  if (!template) {
    return `<!-- Unknown section type: ${section.type} -->`
  }
  return template(section.content)
}

function generateNavigation(nav: { label: string; href: string }[], brandColors: BrandColors): string {
  return `
<nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" class="text-xl font-bold" style="color: var(--primary)">Logo</a>
    <div class="hidden md:flex items-center gap-8">
      ${nav.map(item => `
        <a href="${item.href}" class="text-gray-600 hover:text-gray-900 transition-colors font-medium">${item.label}</a>
      `).join('')}
    </div>
    <button class="px-6 py-2 rounded-lg font-semibold text-white transition-transform hover:scale-105" style="background: var(--primary)">
      Get Started
    </button>
  </div>
</nav>
<div class="h-16"></div>
`
}

export function generateWebsiteHTML(
  structure: WebsiteStructure,
  brandColors: BrandColors,
  businessName: string
): string {
  const homePage = structure.pages.find(p => p.slug === '/' || p.slug === 'home' || p.name.toLowerCase() === 'home')
  const page = homePage || structure.pages[0]

  if (!page) {
    return '<!-- No pages defined -->'
  }

  const sections = page.sections.map(generateSection).join('\n')
  const navigation = generateNavigation(structure.navigation, brandColors)
  const footer = footerTemplate({
    ...structure.footer,
    company_name: structure.footer?.company_name || businessName,
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${brandColors.primary || '#1557F6'};
      --secondary: ${brandColors.secondary || '#E5E7EB'};
      --accent: ${brandColors.accent || '#10B981'};
      --background: ${brandColors.background || '#F9FAFB'};
      --text: ${brandColors.text || '#111827'};
    }

    * {
      font-family: 'Inter', sans-serif;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      color: var(--text);
      background: white;
    }
  </style>
</head>
<body>
${navigation}
<main>
${sections}
</main>
${footer}
</body>
</html>`
}

export function generateDefaultHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center p-8">
    <h1 class="text-2xl font-bold text-gray-700 mb-4">Website Preview</h1>
    <p class="text-gray-500">Generating website structure...</p>
  </div>
</body>
</html>`
}
