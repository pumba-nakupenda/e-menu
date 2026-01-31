"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, X, CheckCircle2 } from "lucide-react";

interface WaiterCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang?: "FR" | "EN";
    tableNumber?: string;
    isReminder?: boolean; // Ajouté
}

export default function WaiterCallModal({ isOpen, onClose, lang = "FR", tableNumber, isReminder }: WaiterCallModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-surface border border-white/10 p-10 rounded-[40px] w-full max-w-sm text-center shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent-gold/20">
                            {isReminder ? (
                                <CheckCircle2 size={32} className="text-accent-gold" />
                            ) : (
                                <UserCheck size={32} className="text-accent-gold" />
                            )}
                        </div>

                        <h2 className="font-display font-bold text-[28px] text-white leading-tight mb-4">
                            {isReminder 
                                ? (lang === "EN" ? "Request Received" : "Demande reçue")
                                : (lang === "EN" ? "Waiter is coming" : "Le serveur arrive")
                            }
                        </h2>
                        <p className="text-text-secondary text-[15px] leading-relaxed mb-10 opacity-80">
                            {isReminder
                                ? (lang === "EN"
                                    ? `Table ${tableNumber || "..."}: Your call has already been noted. Our team is arriving as quickly as possible.`
                                    : `Table ${tableNumber || "..."} : Votre appel a bien été noté. Notre équipe arrive vers vous le plus rapidement possible.`)
                                : (lang === "EN"
                                    ? `Table ${tableNumber || "..."}: A member of our team has been notified and will be with you shortly.`
                                    : `Table ${tableNumber || "..."} : Un membre de notre équipe a été notifié et se dirigera vers vous dans quelques instants.`)
                            }
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full bg-accent-gold text-background font-bold py-4 rounded-[20px] shadow-gold active:scale-95 transition-all"
                        >
                            {lang === "EN" ? "Perfect, thank you" : "Parfait, merci"}
                        </button>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-text-secondary hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
