import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'
import { projectId, dataset, apiVersion } from '@/sanity/env'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id) {
      return NextResponse.json({ error: "ID de notification manquant" }, { status: 400 })
    }

    const result = await writeClient
      .patch(id)
      .set({ status: status || 'done' })
      .commit({ visibility: 'sync' }) // Force la synchronisation immédiate

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("Erreur API Resolve Call:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
