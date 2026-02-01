import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // VERIFICATION CRITIQUE DES CLÉS
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!sbUrl || sbUrl.includes("placeholder")) {
        return NextResponse.json({ 
            error: "CONFIGURATION MANQUANTE", 
            message: "Votre URL Supabase n'est pas configurée dans Vercel ou .env.local" 
        }, { status: 500 });
    }

    const { data: insertData, error: insertError } = await supabase.from("users").insert({
      name,
      email,
      password: hashedPassword,
      verification_token: verificationToken,
      is_verified: false,
    });

    if (insertError) {
      return NextResponse.json({ 
        error: `Erreur Supabase: ${insertError.message}`, 
        code: insertError.code,
        details: insertError.details 
      }, { status: 400 });
    }

    // Envoyer l'email de vérification
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: "E-MENU <oudama@lolly.sn>",
        to: email,
        subject: "Vérifiez votre compte E-MENU",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px;">
            <h1 style="color: #d4af37; font-style: italic; text-align: center;">E-MENU</h1>
            <p>Bonjour ${name},</p>
            <p>Merci de nous rejoindre. Veuillez cliquer sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verifyUrl}" style="background-color: #d4af37; color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">Vérifier mon compte</a>
            </div>
            <p style="color: #8e8e93; font-size: 12px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/> ${verifyUrl}</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // On continue quand même car l'utilisateur est créé
    }

    return NextResponse.json({ message: "Utilisateur créé. Veuillez vérifier vos emails." }, { status: 201 });
  } catch (error: any) {
    console.error("DEBUG SIGNUP ERROR:", error);
    return NextResponse.json({ 
      error: "Erreur technique lors de l'inscription",
      message: error.message,
      stack: error.stack,
      raw: JSON.stringify(error)
    }, { status: 500 });
  }
}

    