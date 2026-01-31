"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, X, CheckCircle2, Clock } from "lucide-react";

interface WaiterCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang?: "FR" | "EN";
    tableNumber?: string;
    status: 'pending' | 'processing';
}

export default function WaiterCallModal({ isOpen, onClose, lang = "FR", tableNumber, status }: WaiterCallModalProps) {
    const isProcessing = status === 'processing';

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
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border",
                            isProcessing ? "bg-blue-500/10 border-blue-500/20" : "bg-accent-gold/10 border-accent-gold/20"
                        )}>
                            {isProcessing ? (
                                <Clock size={32} className="text-blue-400 animate-pulse" />
                            ) : (
                                <UserCheck size={32} className="text-accent-gold" />
                            )}
                        </div>

                        <h2 className="font-display font-bold text-[28px] text-white leading-tight mb-4">
                            {isProcessing 
                                ? (lang === "EN" ? "Waiter is coming" : "Un serveur est en route")
                                : (lang === "EN" ? "Request Noted" : "Demande notée")
                            }
                        </h2>
                        <p className="text-text-secondary text-[15px] leading-relaxed mb-10 opacity-80">
                            {isProcessing
                                ? (lang === "EN"
                                    ? `Table ${tableNumber || "..."}: A waiter has taken your request and is heading to your table.`
                                    : `Table ${tableNumber || "..."} : Un serveur a pris en charge votre demande et se dirige vers vous.`)
                                : (lang === "EN"
                                    ? `Table ${tableNumber || "..."}: Your request has been sent to our team.`
                                    : `Table ${tableNumber || "..."} : Votre demande a bien été transmise à notre équipe.`)
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
