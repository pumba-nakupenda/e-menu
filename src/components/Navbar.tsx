"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavbarProps {
    onSearchClick: () => void;
    lang: "FR" | "EN";
    onLangChange: (lang: "FR" | "EN") => void;
    tableNumber?: string;
    hasActiveCall?: boolean; // Ajouté
}

export default function Navbar({ onSearchClick, lang, onLangChange, tableNumber, hasActiveCall }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="text-accent-gold">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 9H9V2H7V9H5V2H3V9C3 11.12 4.66 12.84 6.75 12.97V22H9.25V12.97C11.34 12.84 13 11.12 13 9V2H11V9ZM16 6V14h3v8h2V2c-2.76 0-5 2.24-5 4z" />
                    </svg>
                </div>
                <span className="font-display font-bold text-xl tracking-tight italic">E-MENU</span>
                {tableNumber && (
                    <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg ml-2">
                        <span className="text-[10px] font-bold text-accent-gold uppercase tracking-tighter">Table {tableNumber}</span>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                <button
                    onClick={onSearchClick}
                    className="p-1 hover:text-accent-gold transition-colors text-white"
                >
                    <Search size={22} strokeWidth={1.5} />
                </button>

                {/* Language Toggle */}
                <button
                    onClick={() => onLangChange(lang === "FR" ? "EN" : "FR")}
                    className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5 transition-all active:scale-95"
                >
                    <span className={lang === "FR" ? "text-accent-gold" : "text-text-secondary"}>FR</span>
                    <span className="w-px h-2.5 bg-white/10" />
                    <span className={lang === "EN" ? "text-accent-gold" : "text-text-secondary"}>EN</span>
                </button>

                {/* Notification Bell with Pulse */}
                <div className="relative p-1">
                    <Bell className={cn("w-6 h-6 transition-colors", hasActiveCall ? "text-accent-gold" : "text-white")} strokeWidth={1.5} />
                    {hasActiveCall && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-gold rounded-full"
                            />
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-gold rounded-full border-2 border-background" />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
