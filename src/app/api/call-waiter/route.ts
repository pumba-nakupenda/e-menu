import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'
import { projectId, dataset, apiVersion } from '@/sanity/env'

// Client avec droit d'écriture (utilisé uniquement côté serveur)
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN, // Ce token doit être ajouté dans .env.local
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableNumber, type } = body

    if (!tableNumber) {
      return NextResponse.json({ error: "Numéro de table manquant" }, { status: 400 })
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.error("ERREUR: Le token SANITY_API_WRITE_TOKEN est manquant dans .env.local");
      return NextResponse.json({ error: "Configuration serveur incomplète (Token manquant)" }, { status: 500 })
    }

    const result = await writeClient.create({
      _type: 'notification',
      tableNumber: tableNumber,
      status: 'pending',
      type: type || 'waiter',
    }, { visibility: 'sync' }) // Force la synchronisation immédiate pour les listeners

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("DÉTAIL ERREUR API SANITY:", error)
    return NextResponse.json({ 
      error: "Erreur Sanity", 
      message: error.message,
      details: error.response?.body || "Pas de détails"
    }, { status: 500 })
  }
}
