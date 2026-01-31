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

    // GÉNÉRER UN ID UNIQUE IMMÉDIATEMENT
    const notificationId = `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    // LANCER LES DEUX EN PARALLÈLE (VRAI TEMPS RÉEL)
    // On ne fait pas "await" sur Sanity avant de lancer Pusher
    const pusherPromise = pusher.trigger('staff-notifications', 'new-call', {
      _id: notificationId,
      tableNumber,
      type: type || 'waiter',
      status: 'pending',
      _createdAt: timestamp
    });

    const sanityPromise = writeClient.create({
      _id: notificationId, // On force le même ID dans Sanity
      _type: 'notification',
      tableNumber: tableNumber,
      status: 'pending',
      type: type || 'waiter',
    });

    // On attend que les deux soient lancés
    await Promise.all([pusherPromise, sanityPromise]);

    return NextResponse.json({ success: true, id: notificationId })
  } catch (error: any) {
    console.error("DÉTAIL ERREUR API SANITY/PUSHER:", error)
    return NextResponse.json({ 
      error: "Erreur serveur", 
      message: error.message 
    }, { status: 500 })
  }
}