import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'
import { projectId, dataset, apiVersion } from '@/sanity/env'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})

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

    // 1. Prévenir tout le monde que l'appel est résolu (0 latence pour faire disparaître la carte)
    await pusher.trigger('staff-notifications', 'resolved-call', { id })

    // 2. Mettre à jour Sanity
    const result = await writeClient
      .patch(id)
      .set({ status: status || 'done' })
      .commit()

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("Erreur API Resolve Call:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}