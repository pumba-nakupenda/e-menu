"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronRight, History } from "lucide-react";
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
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />

                        <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center border-b border-white/5">
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
                            <h2 className="text-xl font-display font-bold text-white italic">{session.user?.name}</h2>
                            <p className="text-text-secondary text-sm opacity-60">{session.user?.email}</p>
                        </div>

                        <div className="p-6 space-y-2">
                            <Link 
                                href="/dashboard" 
                                onClick={onClose}
                                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-accent-gold/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                                        <History size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-bold text-sm">{lang === "EN" ? "My History" : "Mon Historique"}</p>
                                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">{lang === "EN" ? "Saved selections" : "Sélections sauvegardées"}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-white/20 group-hover:text-accent-gold transition-colors" />
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
                                className="w-full h-14 bg-white/5 text-white/50 font-bold rounded-2xl border border-white/5 uppercase text-xs tracking-[0.2em]"
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