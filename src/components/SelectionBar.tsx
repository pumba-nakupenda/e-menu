"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, BellRing, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionBarProps {
    itemCount: number;
    onCallWaiter: () => void;
    onViewSelection: () => void;
    lang?: "FR" | "EN";
}

export default function SelectionBar({ itemCount, onCallWaiter, onViewSelection, lang = "FR" }: SelectionBarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-[360px] px-4">
            <div className="bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 rounded-[30px] p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                {/* Selection Access */}
                <button
                    onClick={onViewSelection}
                    className={cn(
                        "relative h-[54px] rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 px-5",
                        itemCount > 0
                            ? "bg-white/5 text-white border border-white/5"
                            : "text-white/30 pointer-events-none"
                    )}
                >
                    <ClipboardList size={20} className={itemCount > 0 ? "text-accent-gold" : ""} />
                    <span className="font-bold text-[14px]">
                        {lang === "EN" ? "My Selection" : "Ma Sélection"}
                    </span>
                    {itemCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1C1C1E]">
                            {itemCount}
                        </div>
                    )}
                </button>

                {/* Priority: Call Waiter */}
                <button
                    onClick={onCallWaiter}
                    className="flex-1 bg-accent-gold h-[54px] rounded-[24px] flex items-center justify-center gap-2.5 shadow-gold active:scale-95 transition-all text-background font-bold text-[14px] px-4"
                >
                    <BellRing size={18} strokeWidth={3} />
                    <span className="italic uppercase tracking-tight">
                        {lang === "EN" ? "Call Waiter" : "Appeler serveur"}
                    </span>
                </button>
            </div>
        </div>
    );
}
