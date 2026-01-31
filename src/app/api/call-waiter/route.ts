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
    const { tableNumber, type } = body

    if (!tableNumber) {
      return NextResponse.json({ error: "Numéro de table manquant" }, { status: 400 })
    }

    const notificationId = `call-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Arrière-plan pour Pusher et Sanity
    (async () => {
      try {
        await pusherServer.trigger('staff-notifications', 'new-call', {
          _id: notificationId,
          tableNumber,
          type: type || 'waiter',
          status: 'pending',
          _createdAt: timestamp
        });
        
        await writeClient.create({
          _id: notificationId,
          _type: 'notification',
          tableNumber: tableNumber,
          status: 'pending',
          type: type || 'waiter',
        });
      } catch (err) {
        console.error("BACKGROUND ERROR:", err);
      }
    })();

    return NextResponse.json({ success: true, id: notificationId })
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur serveur", message: error.message }, { status: 500 })
  }
}
