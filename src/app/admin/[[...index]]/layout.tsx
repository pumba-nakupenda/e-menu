"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Liste des emails autorisés (récupérée depuis les variables d'environnement)
    // Note: process.env.NEXT_PUBLIC_... est nécessaire pour y accéder côté client
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || ["oudama@lolly.sn"];

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/admin");
        } else if (status === "authenticated" && !adminEmails.includes(session.user?.email || "")) {
            // Si connecté mais pas admin, redirection vers l'accueil
            router.push("/");
        }
    }, [status, session, router, adminEmails]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-accent-gold" size={40} />
            </div>
        );
    }

    if (status === "authenticated" && adminEmails.includes(session.user?.email || "")) {
        return (
            <div className="sanity-studio">
                {children}
            </div>
        );
    }

    return null;
}