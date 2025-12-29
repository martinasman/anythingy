// HTML templates for website sections

export const heroTemplate = (content: Record<string, unknown>) => `
<section class="hero min-h-[80vh] flex items-center justify-center text-center px-4">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-5xl md:text-6xl font-bold mb-6" style="color: var(--primary)">
      ${content.headline || 'Welcome'}
    </h1>
    <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
      ${content.subheadline || ''}
    </p>
    <div class="flex flex-wrap gap-4 justify-center">
      ${content.cta_primary ? `<a href="${(content.cta_primary as { href?: string })?.href || '#'}" class="px-8 py-4 rounded-lg font-semibold text-white transition-transform hover:scale-105" style="background: var(--primary)">${(content.cta_primary as { text?: string })?.text || 'Get Started'}</a>` : ''}
      ${content.cta_secondary ? `<a href="${(content.cta_secondary as { href?: string })?.href || '#'}" class="px-8 py-4 rounded-lg font-semibold border-2 transition-colors hover:bg-gray-50" style="border-color: var(--primary); color: var(--primary)">${(content.cta_secondary as { text?: string })?.text || 'Learn More'}</a>` : ''}
    </div>
  </div>
</section>
`

export const featuresTemplate = (content: Record<string, unknown>) => {
  const features = (content.features || content.items || []) as Array<{
    icon?: string
    title?: string
    description?: string
  }>

  return `
<section class="features py-20 px-4" style="background: var(--background)">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Features'}
    </h2>
    <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <div class="grid md:grid-cols-3 gap-8">
      ${features.map(f => `
        <div class="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl" style="background: var(--secondary)">
            ${f.icon || ''}
          </div>
          <h3 class="text-xl font-semibold mb-2" style="color: var(--text)">${f.title || ''}</h3>
          <p class="text-gray-600">${f.description || ''}</p>
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const pricingTemplate = (content: Record<string, unknown>) => {
  const tiers = (content.tiers || content.plans || []) as Array<{
    name?: string
    price?: string
    period?: string
    description?: string
    features?: string[]
    cta?: string
    highlighted?: boolean
  }>

  return `
<section class="pricing py-20 px-4">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Pricing'}
    </h2>
    <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <div class="grid md:grid-cols-3 gap-8">
      ${tiers.map(tier => `
        <div class="p-8 rounded-xl border-2 ${tier.highlighted ? 'border-primary shadow-lg scale-105' : 'border-gray-200'}" style="${tier.highlighted ? 'border-color: var(--primary)' : ''}">
          <h3 class="text-xl font-semibold mb-2">${tier.name || ''}</h3>
          <div class="mb-4">
            <span class="text-4xl font-bold" style="color: var(--primary)">${tier.price || ''}</span>
            <span class="text-gray-500">${tier.period || '/month'}</span>
          </div>
          <p class="text-gray-600 mb-6">${tier.description || ''}</p>
          <ul class="space-y-3 mb-8">
            ${(tier.features || []).map(f => `
              <li class="flex items-center gap-2">
                <svg class="w-5 h-5" style="color: var(--accent)" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                ${f}
              </li>
            `).join('')}
          </ul>
          <button class="w-full py-3 rounded-lg font-semibold transition-colors ${tier.highlighted ? 'text-white' : ''}" style="background: ${tier.highlighted ? 'var(--primary)' : 'var(--secondary)'}; color: ${tier.highlighted ? 'white' : 'var(--text)'}">
            ${tier.cta || 'Get Started'}
          </button>
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const testimonialsTemplate = (content: Record<string, unknown>) => {
  const testimonials = (content.testimonials || content.items || []) as Array<{
    quote?: string
    author?: string
    role?: string
    avatar?: string
  }>

  return `
<section class="testimonials py-20 px-4" style="background: var(--secondary)">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-12" style="color: var(--text)">
      ${content.headline || content.title || 'What Our Customers Say'}
    </h2>
    <div class="grid md:grid-cols-3 gap-8">
      ${testimonials.map(t => `
        <div class="p-6 rounded-xl bg-white shadow-sm">
          <p class="text-gray-600 mb-6 italic">"${t.quote || ''}"</p>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold" style="color: var(--primary)">
              ${t.author?.[0] || '?'}
            </div>
            <div>
              <p class="font-semibold" style="color: var(--text)">${t.author || ''}</p>
              <p class="text-sm text-gray-500">${t.role || ''}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const ctaTemplate = (content: Record<string, unknown>) => `
<section class="cta py-20 px-4" style="background: var(--primary)">
  <div class="max-w-4xl mx-auto text-center text-white">
    <h2 class="text-3xl md:text-4xl font-bold mb-4">
      ${content.headline || content.title || 'Ready to Get Started?'}
    </h2>
    <p class="text-xl mb-8 opacity-90">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <a href="${(content.cta as { href?: string })?.href || '#'}" class="inline-block px-8 py-4 rounded-lg font-semibold bg-white transition-transform hover:scale-105" style="color: var(--primary)">
      ${(content.cta as { text?: string })?.text || content.button_text || 'Get Started Now'}
    </a>
  </div>
</section>
`

export const faqTemplate = (content: Record<string, unknown>) => {
  const faqs = (content.faqs || content.items || content.questions || []) as Array<{
    question?: string
    answer?: string
  }>

  return `
<section class="faq py-20 px-4">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-12" style="color: var(--text)">
      ${content.headline || content.title || 'Frequently Asked Questions'}
    </h2>
    <div class="space-y-4">
      ${faqs.map((faq, i) => `
        <details class="group p-6 rounded-xl bg-white border border-gray-200">
          <summary class="flex justify-between items-center cursor-pointer font-semibold" style="color: var(--text)">
            ${faq.question || ''}
            <span class="transition-transform group-open:rotate-180">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </span>
          </summary>
          <p class="mt-4 text-gray-600">${faq.answer || ''}</p>
        </details>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const contactTemplate = (content: Record<string, unknown>) => `
<section class="contact py-20 px-4" style="background: var(--background)">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Contact Us'}
    </h2>
    <p class="text-center text-gray-600 mb-12">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <form class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <input type="text" placeholder="Name" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" style="--tw-ring-color: var(--primary)">
        <input type="email" placeholder="Email" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary">
      </div>
      <input type="text" placeholder="Subject" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary">
      <textarea placeholder="Message" rows="5" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary resize-none"></textarea>
      <button type="submit" class="w-full py-4 rounded-lg font-semibold text-white transition-colors hover:opacity-90" style="background: var(--primary)">
        ${content.button_text || 'Send Message'}
      </button>
    </form>
  </div>
</section>
`

export const aboutTemplate = (content: Record<string, unknown>) => `
<section class="about py-20 px-4">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-8" style="color: var(--text)">
      ${content.headline || content.title || 'About Us'}
    </h2>
    <div class="prose prose-lg mx-auto text-gray-600">
      <p>${content.description || content.text || ''}</p>
    </div>
  </div>
</section>
`

export const servicesTemplate = (content: Record<string, unknown>) => {
  const services = (content.services || content.items || []) as Array<{
    icon?: string
    title?: string
    description?: string
  }>

  return `
<section class="services py-20 px-4" style="background: var(--background)">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Our Services'}
    </h2>
    <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${services.map(s => `
        <div class="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div class="w-14 h-14 rounded-lg flex items-center justify-center mb-4 text-2xl" style="background: var(--secondary)">
            ${s.icon || ''}
          </div>
          <h3 class="text-xl font-semibold mb-3" style="color: var(--text)">${s.title || ''}</h3>
          <p class="text-gray-600">${s.description || ''}</p>
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const menuTemplate = (content: Record<string, unknown>) => {
  const categories = (content.categories || []) as Array<{
    name?: string
    items?: Array<{
      name?: string
      description?: string
      price?: string
      image?: string
    }>
  }>

  return `
<section class="menu py-20 px-4" style="background: var(--background)">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Our Menu'}
    </h2>
    <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <div class="space-y-12">
      ${categories.map(cat => `
        <div>
          <h3 class="text-2xl font-bold mb-6 pb-2 border-b-2" style="color: var(--primary); border-color: var(--primary)">
            ${cat.name || ''}
          </h3>
          <div class="grid md:grid-cols-2 gap-6">
            ${(cat.items || []).map(item => `
              <div class="flex justify-between items-start p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div class="flex-1">
                  <h4 class="font-semibold text-lg" style="color: var(--text)">${item.name || ''}</h4>
                  <p class="text-gray-500 text-sm mt-1">${item.description || ''}</p>
                </div>
                <span class="font-bold text-lg ml-4" style="color: var(--primary)">${item.price || ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const galleryTemplate = (content: Record<string, unknown>) => {
  const images = (content.images || content.items || []) as Array<{
    src?: string
    alt?: string
    caption?: string
  }>

  return `
<section class="gallery py-20 px-4">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Gallery'}
    </h2>
    <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      ${images.map(img => `
        <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group">
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          ${img.caption ? `
            <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              ${img.caption}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const locationTemplate = (content: Record<string, unknown>) => {
  const hours = (content.hours || []) as Array<{
    day?: string
    time?: string
  }>

  return `
<section class="location py-20 px-4" style="background: var(--background)">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-12" style="color: var(--text)">
      ${content.headline || content.title || 'Visit Us'}
    </h2>
    <div class="grid md:grid-cols-2 gap-12">
      <div class="space-y-6">
        <div>
          <h3 class="font-semibold text-lg mb-2" style="color: var(--primary)">Address</h3>
          <p class="text-gray-600">${content.address || ''}</p>
        </div>
        ${content.phone ? `
          <div>
            <h3 class="font-semibold text-lg mb-2" style="color: var(--primary)">Phone</h3>
            <a href="tel:${content.phone}" class="text-gray-600 hover:underline">${content.phone}</a>
          </div>
        ` : ''}
        ${content.email ? `
          <div>
            <h3 class="font-semibold text-lg mb-2" style="color: var(--primary)">Email</h3>
            <a href="mailto:${content.email}" class="text-gray-600 hover:underline">${content.email}</a>
          </div>
        ` : ''}
        ${hours.length > 0 ? `
          <div>
            <h3 class="font-semibold text-lg mb-2" style="color: var(--primary)">Hours</h3>
            <table class="text-gray-600">
              ${hours.map(h => `
                <tr>
                  <td class="pr-4 py-1 font-medium">${h.day || ''}</td>
                  <td class="py-1">${h.time || ''}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}
      </div>
      <div class="bg-gray-200 rounded-xl h-64 md:h-auto flex items-center justify-center">
        <div class="text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="text-sm">Map placeholder</p>
        </div>
      </div>
    </div>
  </div>
</section>
`
}

export const productsTemplate = (content: Record<string, unknown>) => {
  const products = (content.products || content.items || []) as Array<{
    name?: string
    description?: string
    price?: string
    image?: string
    badge?: string
  }>

  return `
<section class="products py-20 px-4">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4" style="color: var(--text)">
      ${content.headline || content.title || 'Our Products'}
    </h2>
    <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      ${content.subheadline || content.subtitle || ''}
    </p>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      ${products.map(p => `
        <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
          <div class="aspect-square bg-gray-100 relative">
            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            ${p.badge ? `
              <span class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full text-white" style="background: var(--accent)">
                ${p.badge}
              </span>
            ` : ''}
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1" style="color: var(--text)">${p.name || ''}</h3>
            <p class="text-gray-500 text-sm mb-3 line-clamp-2">${p.description || ''}</p>
            <div class="flex items-center justify-between">
              <span class="text-xl font-bold" style="color: var(--primary)">${p.price || ''}</span>
              <button class="px-4 py-2 rounded-lg font-medium text-white text-sm transition-transform hover:scale-105" style="background: var(--primary)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>
`
}

export const footerTemplate = (footer: { company_name?: string; tagline?: string; links?: Array<{ label: string; href: string }>; social?: Array<{ platform: string; url: string }> }) => `
<footer class="py-12 px-4 border-t border-gray-200">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h3 class="text-xl font-bold" style="color: var(--primary)">${footer.company_name || ''}</h3>
        <p class="text-gray-500 text-sm">${footer.tagline || ''}</p>
      </div>
      <nav class="flex flex-wrap gap-6">
        ${(footer.links || []).map(link => `
          <a href="${link.href}" class="text-gray-600 hover:text-gray-900 transition-colors">${link.label}</a>
        `).join('')}
      </nav>
    </div>
    <div class="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
      &copy; ${new Date().getFullYear()} ${footer.company_name || ''}. All rights reserved.
    </div>
  </div>
</footer>
`
