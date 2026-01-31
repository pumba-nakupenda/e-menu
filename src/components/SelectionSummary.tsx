"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Trash2, BellRing } from "lucide-react";
import Image from "next/image";
import { Dish } from "./MenuItem";
interface SelectionSummaryProps {
    isOpen: boolean;
    selectedIds: Set<string>;
    dishes: Dish[]; // Added dishes prop
    onClose: () => void;
    onRemove: (dishId: string) => void;
    onCallWaiter: () => void;
    lang?: "FR" | "EN";
}

export default function SelectionSummary({ isOpen, selectedIds, dishes, onClose, onRemove, onCallWaiter, lang = "FR" }: SelectionSummaryProps) {
    const selectedDishes = dishes.filter(d => selectedIds.has(d.id));

    const formatPrice = (price: number) => {
        return price.toLocaleString("fr-FR").replace(/\s/g, "\u00A0") + "\u00A0F";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[115] flex items-end justify-center">
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
                        className="relative w-full max-w-md bg-surface rounded-t-[40px] shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Handle Bar */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-20" />

                        <div className="px-8 pt-10 pb-6 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="text-accent-gold" size={24} />
                                <h2 className="font-display font-bold text-2xl text-white italic">
                                    {lang === "EN" ? "My Selection" : "Ma Sélection"}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-text-secondary hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
                            {selectedDishes.length > 0 ? (
                                selectedDishes.map(dish => (
                                    <div key={dish.id} className="flex items-center gap-4 group">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                            <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-display font-semibold text-white text-[16px] mb-0.5">
                                                {lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title}
                                            </h4>
                                            <p className="text-[13px] text-accent-gold font-bold">{formatPrice(dish.price)}</p>
                                        </div>
                                        <button
                                            onClick={() => onRemove(dish.id)}
                                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-30">
                                    <ClipboardList size={48} className="mx-auto mb-4" />
                                    <p className="italic">
                                        {lang === "EN" ? "Your selection is empty" : "Aucun plat dans votre sélection"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-8 pb-10 pt-6 bg-gradient-to-t from-surface to-transparent">
                            <button
                                onClick={onCallWaiter}
                                className="w-full bg-accent-gold text-background font-bold h-[60px] rounded-[24px] flex items-center justify-center gap-3 shadow-gold active:scale-95 transition-all text-lg"
                            >
                                <BellRing size={20} strokeWidth={3} />
                                <span className="uppercase tracking-widest">
                                    {lang === "EN" ? "Call Waiter" : "Appeler le serveur"}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
