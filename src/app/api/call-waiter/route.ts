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

    // 1. Créer dans Sanity (Historique) - Sans 'sync' c'est déjà ultra rapide
    const result = await writeClient.create({
      _type: 'notification',
      tableNumber: tableNumber,
      status: 'pending',
      type: type || 'waiter',
    })

    // 2. Déclencher Pusher (avec le vrai ID)
    await pusher.trigger('staff-notifications', 'new-call', {
      _id: result._id,
      tableNumber,
      type: type || 'waiter',
      status: 'pending',
      _createdAt: result._createdAt || new Date().toISOString()
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("DÉTAIL ERREUR API SANITY/PUSHER:", error)
    return NextResponse.json({ 
      error: "Erreur serveur", 
      message: error.message 
    }, { status: 500 })
  }
}