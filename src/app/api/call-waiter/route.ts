import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'
import { projectId, dataset, apiVersion } from '@/sanity/env'
import Pusher from 'pusher'

// Configurer Pusher
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
    const { tableNumber, type } = body

    if (!tableNumber) {
      return NextResponse.json({ error: "Numéro de table manquant" }, { status: 400 })
    }

    const notificationId = `call-${Date.now()}`;
    const timestamp = new Date().toISOString();

    console.log("API CALL - Table:", tableNumber, "Type:", type);

    // Lancement en arrière-plan sans bloquer la réponse
    (async () => {
      try {
        // 1. Pusher
        await pusher.trigger('staff-notifications', 'new-call', {
          _id: notificationId,
          tableNumber,
          type: type || 'waiter',
          status: 'pending',
          _createdAt: timestamp
        });
        
        // 2. Sanity
        await writeClient.create({
          _id: notificationId,
          _type: 'notification',
          tableNumber: tableNumber,
          status: 'pending',
          type: type || 'waiter',
        });
        
        console.log("BACKGROUND TASKS OK for", notificationId);
      } catch (err) {
        console.error("BACKGROUND TASKS ERROR:", err);
      }
    })();

    // RÉPONSE IMMÉDIATE AU CLIENT
    return NextResponse.json({ success: true, id: notificationId })
  } catch (error: any) {
    console.error("DÉTAIL ERREUR API SANITY/PUSHER:", error)
    return NextResponse.json({ 
      error: "Erreur serveur", 
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}