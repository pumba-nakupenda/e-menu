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

    // 1. Créer dans Sanity (Historique)
    const result = await writeClient.create({
      _type: 'notification',
      tableNumber: tableNumber,
      status: 'pending',
      type: type || 'waiter',
    })

    console.log("SANITY OK:", result._id);

    // 2. Déclencher Pusher (Tentative)
    let pusherStatus = "sent";
    try {
      await pusher.trigger('staff-notifications', 'new-call', {
        _id: result._id,
        tableNumber,
        type: type || 'waiter',
        status: 'pending',
        _createdAt: result._createdAt || new Date().toISOString()
      })
    } catch (pusherError: any) {
      console.error("ERREUR PUSHER:", pusherError);
      pusherStatus = `error: ${pusherError.message || 'unknown'}`;
    }

    return NextResponse.json({ 
      success: true, 
      result, 
      pusherStatus // On renvoie l'état pour débugger
    })
  } catch (error: any) {
    console.error("DÉTAIL ERREUR API SANITY/PUSHER:", error)
    return NextResponse.json({ 
      error: "Erreur serveur", 
      message: error.message 
    }, { status: 500 })
  }
}