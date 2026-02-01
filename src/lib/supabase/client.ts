import { createClient } from '@supabase/supabase-js'

// On utilise .trim() pour enlever les espaces accidentels au début ou à la fin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error("❌ Erreur : NEXT_PUBLIC_SUPABASE_URL est manquante ou invalide.")
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder') {
    console.error("❌ Erreur : NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante ou invalide.")
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
)