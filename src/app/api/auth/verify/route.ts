import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin?error=Token manquant", req.url));
  }

  try {
    // Trouver l'utilisateur avec ce token
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("verification_token", token)
      .single();

    if (findError || !user) {
      return NextResponse.redirect(new URL("/auth/signin?error=Token invalide", req.url));
    }

    // Activer l'utilisateur
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        is_verified: true,
        verification_token: null 
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Rediriger vers la connexion avec succès
    return NextResponse.redirect(new URL("/auth/signin?message=Compte vérifié ! Vous pouvez vous connecter.", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/signin?error=Erreur serveur", req.url));
  }
}
