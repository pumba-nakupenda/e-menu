"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronRight, History, Settings, ExternalLink } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface AccountMenuProps {
    isOpen: boolean;
    onClose: () => void;
    lang: "FR" | "EN";
    onLangChange: (lang: "FR" | "EN") => void;
}

export default function AccountMenu({ isOpen, onClose, lang, onLangChange }: AccountMenuProps) {
    const { data: session } = useSession();

    if (!session) return null;

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || ["oudama@lolly.sn"];
    const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-end justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-surface rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-text-secondary/20 rounded-full" />

                        <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center border-b border-border">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-accent-gold mb-4 p-1">
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-accent-gold/20 flex items-center justify-center">
                                            <User size={32} className="text-accent-gold" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h2 className="text-xl font-display font-bold text-text-primary italic">{session.user?.name}</h2>
                            <p className="text-text-secondary text-sm opacity-60">{session.user?.email}</p>
                        </div>

                        <div className="p-6 space-y-2">
                            {/* ADMIN BUTTON - Only visible to admins */}
                            {isAdmin && (
                                <Link 
                                    href="/admin" 
                                    onClick={onClose}
                                    className="w-full flex items-center justify-between p-4 bg-accent-gold rounded-2xl border border-accent-gold/20 hover:scale-[1.02] transition-all group mb-4 shadow-gold"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-background/20 flex items-center justify-center text-background">
                                            <Settings size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-background font-black text-sm uppercase italic">Console Admin</p>
                                            <p className="text-background/60 text-[9px] font-bold uppercase tracking-widest">Gérer le Restaurant</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={18} className="text-background/40" />
                                </Link>
                            )}

                            <Link 
                                href="/dashboard" 
                                onClick={onClose}
                                className="w-full flex items-center justify-between p-4 bg-text-primary/5 rounded-2xl border border-border hover:border-accent-gold/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                                        <History size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-text-primary font-bold text-sm">{lang === "EN" ? "My History" : "Mon Historique"}</p>
                                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">{lang === "EN" ? "Saved selections" : "Sélections sauvegardées"}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-text-primary/20 group-hover:text-accent-gold transition-colors" />
                            </Link>

                            <button 
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-4 p-4 text-red-400/60 hover:text-red-400 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                                    <LogOut size={20} />
                                </div>
                                <span className="font-bold text-sm">{lang === "EN" ? "Sign Out" : "Déconnexion"}</span>
                            </button>
                        </div>

                        <div className="p-6 pt-0">
                            <button
                                onClick={onClose}
                                className="w-full h-14 bg-text-primary/5 text-text-primary/50 font-bold rounded-2xl border border-border uppercase text-xs tracking-[0.2em]"
                            >
                                {lang === "EN" ? "Close" : "Fermer"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}