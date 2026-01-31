import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'
import { projectId, dataset, apiVersion } from '@/sanity/env'
import Pusher from 'pusher'

const pusherServer = new Pusher({
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

    // 1. Signal Pusher immédiat (Non-bloquant)
    (async () => {
        try {
            await pusherServer.trigger('staff-notifications', 'resolved-call', { id, status: status || 'done' });
            
            await writeClient
              .patch(id)
              .set({ status: status || 'done' })
              .commit();
        } catch (err) {
            console.error("RESOLVE BACKGROUND ERROR:", err);
        }
    })();

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur", message: error.message }, { status: 500 })
  }
}
