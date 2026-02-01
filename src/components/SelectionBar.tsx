"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionBarProps {
    itemCount: number;
    onViewSelection: () => void;
    lang?: "FR" | "EN";
}

export default function SelectionBar({ itemCount, onViewSelection, lang = "FR" }: SelectionBarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-[360px] px-4">
            <div className="bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 rounded-[30px] p-2 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                {/* Selection Access */}
                <button
                    onClick={onViewSelection}
                    className={cn(
                        "relative flex-1 h-[54px] rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 px-5",
                        itemCount > 0
                            ? "bg-accent-gold text-background font-bold"
                            : "bg-white/5 text-white/30 pointer-events-none"
                    )}
                >
                    <ClipboardList size={20} className={itemCount > 0 ? "text-background" : "text-white/30"} />
                    <span className="font-bold text-[14px]">
                        {lang === "EN" ? "My Selection" : "Ma Sélection"}
                    </span>
                    {itemCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-accent-gold">
                            {itemCount}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}