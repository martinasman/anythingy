import type { FileSystemTree } from '@webcontainer/api'
import type { BrandColors } from '@/types'

export interface Offering {
  id: string
  name: string
  description: string | null
  type: 'product' | 'service' | 'subscription' | 'package'
  price: number // in cents
  currency: string
  checkout_url?: string | null
  booking_url?: string | null
}

export interface ViteTemplateInput {
  businessName: string
  tagline?: string
  brandColors: BrandColors
  offerings: Offering[]
  componentCode: string
}

/**
 * Generates a FileSystemTree for a Vite + React project
 * that can be mounted to WebContainer
 */
export function generateViteProject(input: ViteTemplateInput): FileSystemTree {
  const { businessName, tagline, brandColors, offerings, componentCode } = input

  // Format prices for display
  const formattedOfferings = offerings.map(o => ({
    ...o,
    formattedPrice: formatPrice(o.price, o.currency),
  }))

  const packageJson = {
    name: 'preview',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.2.1',
      vite: '^5.0.0',
    },
  }

  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
})`

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${businessName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${brandColors.primary}',
              secondary: '${brandColors.secondary}',
              accent: '${brandColors.accent}',
              background: '${brandColors.background || '#ffffff'}',
              foreground: '${brandColors.text || '#000000'}',
            },
          },
        },
      }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * {
        font-family: 'Inter', sans-serif;
      }
      html {
        scroll-behavior: smooth;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`

  const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`

  const dataJson = JSON.stringify(
    {
      businessName,
      tagline,
      brandColors,
      offerings: formattedOfferings,
    },
    null,
    2
  )

  return {
    'package.json': {
      file: {
        contents: JSON.stringify(packageJson, null, 2),
      },
    },
    'vite.config.js': {
      file: {
        contents: viteConfig,
      },
    },
    'index.html': {
      file: {
        contents: indexHtml,
      },
    },
    src: {
      directory: {
        'main.jsx': {
          file: {
            contents: mainJsx,
          },
        },
        'App.jsx': {
          file: {
            contents: componentCode,
          },
        },
        'data.json': {
          file: {
            contents: dataJson,
          },
        },
      },
    },
  }
}

/**
 * Format price from cents to display string
 */
function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })
  return formatter.format(amount)
}

/**
 * Generate a simple default App component for testing
 */
export function generateDefaultApp(businessName: string, tagline?: string): string {
  return `export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-primary">${businessName}</span>
            <div className="flex gap-6">
              <a href="#features" className="text-gray-600 hover:text-primary transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            ${businessName}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ${tagline || 'Welcome to our business'}
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition">
              Get Started
            </button>
            <button className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary text-xl">✦</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Feature {i}</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/60">
            © ${new Date().getFullYear()} ${businessName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}`
}
