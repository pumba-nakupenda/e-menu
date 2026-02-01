"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Dish } from "./MenuItem";
import { cn } from "@/lib/utils";

import { BadgeObject } from "./MenuItem";

interface SearchOverlayProps {
    isOpen: boolean;
    cart: Record<string, number>;
    dishes: Dish[];
    categories: string[];
    onClose: () => void;
    onSelectDish: (dish: Dish) => void;
    onUpdateQuantity: (dishId: string, delta: number) => void;
    lang?: "FR" | "EN";
    categoryTranslations?: Record<string, string>;
    badgeIcons?: Record<string, BadgeObject>;
    allBadgeFilters?: string[];
}

export default function SearchOverlay({
    isOpen,
    cart,
    dishes,
    categories,
    onClose,
    onSelectDish,
    onUpdateQuantity,
    lang = "FR",
    categoryTranslations,
    badgeIcons,
    allBadgeFilters = []
}: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [activeBadge, setActiveBadge] = useState<string | null>(null);

    const dynamicBadgeFilters = useMemo(() => {
        const badges = new Set<string>();
        const relevantDishes = activeCategory === "Tous" 
            ? dishes 
            : dishes.filter((d: Dish) => d.category === activeCategory);
            
        relevantDishes.forEach((d: Dish) => {
            d.badgeObjects?.forEach((b: any) => badges.add(b.label));
        });
        return Array.from(badges);
    }, [activeCategory, dishes]);

    useEffect(() => {
        if (activeBadge && !dynamicBadgeFilters.includes(activeBadge)) {
            setActiveBadge(null);
        }
    }, [activeCategory, dynamicBadgeFilters]);

    const filterTranslationsLocal: Record<string, string> = {
        "Tous": "All",
        ...categoryTranslations
    };

    const results = useMemo(() => {
        let base = dishes;
        
        if (activeCategory !== "Tous") {
            base = base.filter(d => d.category === activeCategory);
        }

        if (activeBadge) {
            base = base.filter((d: Dish) => {
                if (d.badgeObjects) {
                    return d.badgeObjects.some((b: any) => b.label === activeBadge);
                }
                return d.badges?.includes(activeBadge);
            });
        }

        if (!query.trim()) return base.slice(0, 8);

        return base.filter((dish: Dish) =>
            dish.title.toLowerCase().includes(query.toLowerCase()) ||
            dish.description.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, activeCategory, activeBadge, dishes]);

    const renderFilterIcon = (filter: string) => {
        if (filter === "Tous") return null;
        if (badgeIcons && badgeIcons[filter]) {
            const b = badgeIcons[filter];
            if (b.iconType === 'emoji') return <span className="mr-1">{b.emoji}</span>;
        }
        return null;
    };

    const topMatch = results.find(r => r.isFeatured) || results[0];
    const moreResults = results.filter(r => r.id !== topMatch?.id);

    const formatPrice = (price: number) => {
        return price.toLocaleString("fr-FR").replace(/\s/g, "\u00A0") + "\u00A0F";
    };

    const QuantitySelector = ({ dishId, isSmall = false }: { dishId: string, isSmall?: boolean }) => {
        const qty = cart[dishId] || 0;
        return (
            <div className={cn(
                "flex items-center bg-text-primary/5 border border-border rounded-full p-1",
                isSmall ? "gap-2" : "gap-4"
            )}>
                {qty > 0 && (
                    <>
                        <button onClick={() => onUpdateQuantity(dishId, -1)} className="p-1 text-text-primary/40"><Minus size={isSmall ? 14 : 18} /></button>
                        <span className="text-text-primary font-bold min-w-[12px] text-center">{qty}</span>
                    </>
                )}
                <button onClick={() => onUpdateQuantity(dishId, 1)} className="p-1 text-accent-gold"><Plus size={isSmall ? 14 : 18} strokeWidth={3} /></button>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] bg-background px-4 pt-6 overflow-y-auto transition-colors duration-300"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gold">
                                <Search size={22} />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                placeholder={lang === "EN" ? "Search for a dish, a wine..." : "Rechercher un plat, un vin..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-surface border-2 border-accent-gold/50 rounded-full py-3.5 pl-12 pr-12 text-text-primary placeholder:text-text-secondary focus:border-accent-gold focus:outline-none transition-all shadow-gold"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-text-primary font-bold text-[16px] pr-2 transition-colors"
                        >
                            {lang === "EN" ? "Close" : "Fermer"}
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        <h3 className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-[0.2em] ml-1">
                            {lang === "EN" ? "Categories" : "Catégories"}
                        </h3>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {["Tous", ...categories].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        setActiveBadge(null);
                                    }}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-[13px] font-bold border transition-all whitespace-nowrap flex items-center shadow-sm",
                                        activeCategory === cat
                                            ? "bg-accent-gold border-accent-gold text-background"
                                            : "bg-surface border-border text-text-secondary"
                                    )}
                                >
                                    {lang === "EN" ? (filterTranslationsLocal[cat] || cat) : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {dynamicBadgeFilters.length > 0 && (
                        <div className="space-y-3 mb-10">
                            <h3 className="text-[10px] font-bold text-accent-gold/50 uppercase tracking-[0.2em] ml-1">
                                {lang === "EN" ? "Specific Filters" : "Filtres Spécifiques"}
                            </h3>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {dynamicBadgeFilters.map((badge) => (
                                    <button
                                        key={badge}
                                        onClick={() => setActiveBadge(activeBadge === badge ? null : badge)}
                                        className={cn(
                                            "px-5 py-2 rounded-full text-[13px] font-bold border transition-all whitespace-nowrap flex items-center shadow-sm",
                                            activeBadge === badge
                                                ? "bg-accent-gold border-accent-gold text-background shadow-gold"
                                                : "bg-surface border-border text-text-secondary hover:border-accent-gold/30"
                                        )}
                                    >
                                        {renderFilterIcon(badge)}
                                        {lang === "EN" ? (filterTranslationsLocal[badge] || badge) : badge}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.length > 0 ? (
                        <div className="space-y-12 pb-24">
                            {topMatch && (
                                <section>
                                    <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">
                                        {lang === "EN" ? "Best Match" : "Meilleur Résultat"}
                                    </h2>
                                    <div className="relative bg-surface p-5 rounded-[32px] border border-border shadow-card">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold/30 shrink-0">
                                                <Image src={topMatch.image} alt={topMatch.title} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-display font-bold text-xl text-text-primary mb-1 italic">
                                                    {lang === "EN" && topMatch.translations?.en ? topMatch.translations.en.title : topMatch.title}
                                                </h3>
                                                <span className="font-bold text-accent-gold">{formatPrice(topMatch.price)}</span>
                                            </div>
                                            <QuantitySelector dishId={topMatch.id} />
                                        </div>
                                        <button
                                            onClick={() => onSelectDish(topMatch)}
                                            className="w-full bg-text-primary/5 hover:bg-text-primary/10 text-text-primary font-bold py-3.5 rounded-[20px] transition-colors"
                                        >
                                            {lang === "EN" ? "View Details" : "Détails du plat"}
                                        </button>
                                    </div>
                                </section>
                            )}

                            {moreResults.length > 0 && (
                                <section>
                                    <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">
                                        {lang === "EN" ? "Other suggestions" : "Autres suggestions"}
                                    </h2>
                                    <div className="space-y-4">
                                        {moreResults.map((dish) => (
                                            <div
                                                key={dish.id}
                                                className="flex items-center gap-4 group"
                                            >
                                                <div 
                                                    className="flex items-center gap-4 flex-1 cursor-pointer"
                                                    onClick={() => onSelectDish(dish)}
                                                >
                                                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-border shadow-sm">
                                                        <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1 border-b border-border pb-4 group-hover:border-accent-gold/30 transition-colors">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-display font-semibold text-text-primary">
                                                                {lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title}
                                                            </h4>
                                                            <span className="text-sm font-bold text-accent-gold">{formatPrice(dish.price)}</span>
                                                        </div>
                                                        <p className="text-[12px] text-text-secondary line-clamp-1 opacity-50 italic">
                                                            {lang === "EN" ? filterTranslationsLocal[dish.category] : dish.category}
                                                        </p>
                                                    </div>
                                                </div>

                                                <QuantitySelector dishId={dish.id} isSmall />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="text-center pt-20">
                            <p className="text-text-secondary italic">
                                {lang === "EN" ? "No items match your search." : "Aucun plat ne correspond à votre recherche."}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}