'use client'

import { SupabaseConnect } from '@/components/settings/SupabaseConnect'

export function SettingsPanel() {
  return (
    <div className="h-full overflow-auto p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Supabase Connection Section */}
        <section className="mb-8">
          <SupabaseConnect />
        </section>

        {/* Future settings sections can be added here */}
        {/*
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          ...
        </section>
        */}
      </div>
    </div>
  )
}
