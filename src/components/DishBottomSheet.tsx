"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Star, Heart, Leaf, Flame, Wheat, Check, CircleHelp, LucideIcon, HelpCircle } from "lucide-react";
import { Dish, BadgeObject } from "./MenuItem";
import { cn } from "@/lib/utils";

// Map for Lucide icons consistent with MenuItem
import { 
    Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat, Waves
} from "lucide-react";

const LucideIconMap: Record<string, any> = {
    Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat
};

interface DishBottomSheetProps {
    dish: Dish | null;
    isOpen: boolean;
    isSelected: boolean;
    onClose: () => void;
    onToggleSelection: (dish: Dish) => void;
    lang?: "FR" | "EN";
}

export default function DishBottomSheet({ dish, isOpen, isSelected, onClose, onToggleSelection, lang = "FR" }: DishBottomSheetProps) {
    if (!dish) return null;

    const formatPrice = (price: number) => {
        return price.toLocaleString("fr-FR").replace(/\s/g, "\u00A0") + "\u00A0F";
    };

    const renderBadgeItem = (b: BadgeObject | string) => {
        if (typeof b === 'string') {
            return (
                <div key={b} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-bold tracking-widest text-accent-gold uppercase">{b}</span>
                </div>
            );
        }

        const iconColor = b.color || '#D4AF37';
        
        return (
            <div key={b.key || b.label} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                {b.iconType === 'image' && b.iconUrl && (
                    <div className="w-4 h-4 relative">
                        <Image src={b.iconUrl} alt={b.label} fill className="object-contain" />
                    </div>
                )}
                {b.iconType === 'lucide' && b.lucideIcon && (() => {
                    const cleanName = b.lucideIcon.trim();
                    const IconComponent = LucideIconMap[cleanName] || LucideIconMap[cleanName.charAt(0).toUpperCase() + cleanName.slice(1)] || HelpCircle;
                    return <IconComponent size={14} style={{ color: iconColor }} />;
                })()}
                {b.emoji && (
                    <span className="text-sm" style={{ color: iconColor }}>{b.emoji}</span>
                )}
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                    {lang === "EN" ? b.labelEn : b.label}
                </span>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-[#1C1C1E] rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                    >
                        {/* Handle Bar */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-30" />

                        {/* Close & Like Buttons - Fixed at top */}
                        <div className="absolute top-6 left-0 right-0 z-30 px-6 flex justify-between items-center pointer-events-none">
                            <button onClick={onClose} className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white pointer-events-auto border border-white/10">
                                <X size={20} strokeWidth={2.5} />
                            </button>
                            <button 
                                onClick={() => onToggleSelection(dish)}
                                className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-accent-gold pointer-events-auto border border-white/10"
                            >
                                <Heart size={20} fill={isSelected ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} />
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="overflow-y-auto no-scrollbar pb-32">
                            {/* Hero Image */}
                            <div className="relative aspect-video w-full bg-gradient-to-b from-gray-800 to-transparent">
                                <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent" />
                            </div>

                            {/* Info Content */}
                            <div className="px-8 -mt-6 relative z-10">
                                <h1 className="font-display font-bold text-[28px] md:text-[32px] text-white leading-[1.1] mb-2">
                                    {lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title}
                                </h1>
                                
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="font-sans font-bold text-[22px] text-accent-gold">{formatPrice(dish.price)}</span>
                                    <span className="text-text-secondary opacity-30 px-1">•</span>
                                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                        <Star size={14} className="text-accent-gold" fill="currentColor" />
                                        <span className="text-[13px] font-semibold text-white">{dish.rating || 4.8}</span>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {dish.badgeObjects && dish.badgeObjects.length > 0 
                                        ? dish.badgeObjects.map(renderBadgeItem)
                                        : dish.badges?.map(renderBadgeItem)
                                    }
                                </div>

                                {/* Story */}
                                <div className="mb-6">
                                    <h3 className="text-white font-bold text-[18px] mb-3 italic font-display">
                                        {lang === "EN" ? "The Story" : "L'Histoire"}
                                    </h3>
                                    <p className="text-text-secondary text-[15px] leading-relaxed opacity-70">
                                        {lang === "EN" && dish.translations?.en
                                            ? (dish.translations.en.story || dish.translations.en.description)
                                            : (dish.description)}
                                        {lang === "FR" && " Sélectionnée avec le plus grand soin par notre chef pour garantir une expérience gustative inoubliable et raffinée."}
                                        {lang === "EN" && !dish.translations?.en?.story && " Selected with the utmost care by our chef to guarantee an unforgettable and refined tasting experience."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button - Sticky at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E] to-transparent pt-10">
                            <button
                                onClick={() => onToggleSelection(dish)}
                                className={cn(
                                    "w-full h-[56px] rounded-[22px] flex items-center justify-center gap-3 transition-all active:scale-95 font-bold text-[16px] shadow-2xl",
                                    isSelected
                                        ? "bg-white/10 border border-accent-gold/40 text-accent-gold"
                                        : "bg-accent-gold text-background shadow-gold"
                                )}
                            >
                                {isSelected ? (
                                    <>
                                        <Check size={20} strokeWidth={3} />
                                        <span>{lang === "EN" ? "Selected" : "Sélectionné"}</span>
                                    </>
                                ) : (
                                    <span>{lang === "EN" ? "Add to my selection" : "Ajouter à ma sélection"}</span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
