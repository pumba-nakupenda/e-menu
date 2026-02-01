"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LogIn, Mail, Lock, Loader2, UserPlus, User } from "lucide-react";
import Link from "next/link";

function SignInContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const urlError = searchParams.get("error");
    const urlMessage = searchParams.get("message");

    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(urlError || "");
    const [message, setMessage] = useState(urlMessage || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        if (isSignUp) {
            // Inscription
            try {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

                setMessage("Un email de confirmation vient de vous être envoyé. Veuillez vérifier votre boîte de réception.");
                setIsSignUp(false);
                setEmail("");
                setName("");
                setPassword("");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Connexion
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl
            });

            if (res?.error) {
                setError("Email ou mot de passe incorrect");
                setIsLoading(false);
            } else {
                router.push(callbackUrl);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] -left-20 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] -right-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-surface border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10"
            >
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-accent-gold transition-colors mb-8 text-sm font-medium">
                    <ChevronLeft size={18} />
                    Retour au menu
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent-gold/20">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-accent-gold">
                            <path d="M11 9H9V2H7V9H5V2H3V9C3 11.12 4.66 12.84 6.75 12.97V22H9.25V12.97C11.34 12.84 13 11.12 13 9V2H11V9ZM16 6V14h3v8h2V2c-2.76 0-5 2.24-5 4z" />
                        </svg>
                    </div>
                    <h1 className="font-display font-bold text-3xl text-white mb-2 italic uppercase tracking-tighter">
                        {isSignUp ? "Créer un compte" : "Se connecter"}
                    </h1>
                    <p className="text-text-secondary text-sm">
                        {isSignUp ? "Rejoignez l'expérience gastronomique" : "Bon retour parmi nous"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center">{error}</div>}
                    {message && <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-xs py-3 px-4 rounded-xl text-center">{message}</div>}
                    
                    <AnimatePresence mode="wait">
                        {isSignUp && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative overflow-hidden"
                            >
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Nom complet"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={isSignUp}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:border-accent-gold outline-none transition-all"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            type="email" 
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:border-accent-gold outline-none transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            type="password" 
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:border-accent-gold outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-accent-gold text-background font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-gold disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />)}
                        {isSignUp ? "S'inscrire" : "Se connecter"}
                    </button>
                </form>

                <div className="text-center mb-8">
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
                        className="text-accent-gold font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                        {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
                    </button>
                </div>

                <div className="flex items-center gap-4 py-2 mb-6">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">Ou continuer avec</span>
                    <div className="h-px bg-white/5 flex-1" />
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl })}
                    className="w-full h-14 bg-white text-background font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.3 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.11c-.22-.67-.35-1.38-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                </button>
            </motion.div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <SignInContent />
        </Suspense>
    );
}
