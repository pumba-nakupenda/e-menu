"use client";

import Image from "next/image";
import { 
    Check, Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Info, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat, // Ajouté ici
    Star, // Ajouté ici
    CircleHelp // Fallback icon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map of available icons for Sanity dynamic selection
const LucideIconMap: Record<string, any> = {
    Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat // Ajouté ici
};

export interface BadgeObject {
    key: string;
    label: string;
    labelEn?: string;
    iconUrl?: string;
    emoji?: string;
    lucideIcon?: string;
    iconType?: 'emoji' | 'image' | 'lucide';
    isOutline?: boolean;
    color?: string;
    category?: string;
}

export interface Dish {
    id: string;
    category: string;
    title: string;
    description: string;
    price: number;
    image: string;
    isFeatured?: boolean;
    isSoldOut?: boolean;
    badges?: string[]; // Legacy for mock data
    badgeObjects?: BadgeObject[]; // New dynamic badges from Sanity
    rating?: number;
    translations?: {
        en: {
            title: string;
            description: string;
            story?: string;
        }
    }
}

interface MenuItemProps {
    dish: Dish;
    isSelected: boolean;
    onToggle: (dish: Dish) => void;
    onShowDetails: (dish: Dish) => void;
}

const DishIcons = ({ badge }: { badge: string }) => {
    switch (badge) {
        // Legacy fallback
        case "VEGAN": return <Leaf size={14} className="text-green-600/80" />;
        case "GLUTEN_FREE": return <Wheat size={14} className="text-amber-500/80" />;
        case "SPICY": return <Flame size={14} className="text-red-500/80" />;
        default: return null;
    }
};

export default function MenuItem({ dish, isSelected, onToggle, onShowDetails }: MenuItemProps) {
    const formatPrice = (price: number) => {
        return price.toLocaleString("fr-FR").replace(/\s/g, "\u00A0") + "\u00A0F";
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(dish);
    };

    // Helper to render badges
    const renderBadges = () => {
        if (dish.badgeObjects && dish.badgeObjects.length > 0) {
            return dish.badgeObjects.map((b) => {
                const iconColor = b.color || '#D4AF37';
                
                if (b.iconType === 'image' && b.iconUrl) {
                    return (
                        <div key={b.key || b.label} className="w-[14px] h-[14px] relative opacity-80" title={b.label}>
                            <Image src={b.iconUrl} alt={b.label} fill className="object-contain" />
                        </div>
                    );
                } 
                
                if (b.iconType === 'lucide' && b.lucideIcon) {
                    // Safe access via map
                    // Remove potential whitespace and capitalize first letter just in case
                    const cleanName = b.lucideIcon.trim();
                    const IconComponent = LucideIconMap[cleanName] || LucideIconMap[cleanName.charAt(0).toUpperCase() + cleanName.slice(1)] || CircleHelp;
                    
                    return (
                        <IconComponent 
                            key={b.key || b.label} 
                            size={14} 
                            strokeWidth={b.isOutline ? 1.5 : 2.5} 
                            style={{ color: iconColor }}
                            className="opacity-90"
                            title={b.label}
                        />
                    );
                }

                if (b.emoji) {
                    return (
                        <span 
                            key={b.key || b.label} 
                            className="text-[14px] leading-none" 
                            title={b.label}
                            style={b.isOutline ? {
                                color: 'transparent',
                                WebkitTextStroke: `1px ${iconColor}`
                            } : { 
                                color: 'transparent', 
                                textShadow: `0 0 0 ${iconColor}`
                            }}
                        >
                            {b.emoji}
                        </span>
                    );
                }

                return <DishIcons key={b.key} badge={b.key} />;
            });
        }
        return dish.badges?.map(b => <DishIcons key={b} badge={b} />);
    };

    if (dish.isFeatured) {
        return (
            <div
                onClick={() => onShowDetails(dish)}
                className="relative bg-surface rounded-[24px] overflow-hidden group cursor-pointer border border-white/5 hover:border-accent-gold/40 transition-all duration-300"
            >
                <div className="relative aspect-[1.5] w-full">
                    <Image
                        src={dish.image}
                        alt={dish.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-accent-gold px-3 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-background tracking-wider uppercase italic">Chef's Choice</span>
                    </div>

                    {/* Circular Checkbox */}
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            isSelected
                                ? "bg-accent-gold text-background scale-110 shadow-gold"
                                : "bg-black/20 backdrop-blur-md border border-white/20 text-white/40 hover:text-white"
                        )}
                    >
                        <Check size={20} strokeWidth={isSelected ? 4 : 2} />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-display font-semibold text-[22px] text-white tracking-tight">{dish.title}</h3>
                            {dish.rating && (
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="fill-accent-gold text-accent-gold" />
                                    <span className="text-[12px] font-bold text-accent-gold/80">{dish.rating}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-sans font-bold text-[18px] text-accent-gold tracking-tight">{formatPrice(dish.price)}</span>
                            <div className="flex gap-1.5 mt-1">
                                {renderBadges()}
                            </div>
                        </div>
                    </div>
                    <p className="text-text-secondary text-[14px] leading-relaxed line-clamp-2 opacity-80">{dish.description}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => !dish.isSoldOut && onShowDetails(dish)}
            className={cn(
                "relative bg-surface p-3.5 rounded-[24px] flex gap-4 transition-all duration-300 border border-white/5",
                dish.isSoldOut ? "opacity-40 grayscale pointer-events-none" : "hover:border-accent-gold/20 cursor-pointer"
            )}
        >
            {/* Image Container */}
            <div className="relative w-[100px] h-[100px] shrink-0 rounded-[20px] overflow-hidden">
                <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                {dish.isSoldOut && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-white border border-white/10">ÉPUISÉ</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 py-1">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="font-display font-semibold text-[17px] text-white tracking-tight line-clamp-1">{dish.title}</h3>
                        {dish.rating && (
                            <div className="flex items-center gap-1">
                                <Star size={10} className="fill-accent-gold text-accent-gold" />
                                <span className="text-[10px] font-bold text-accent-gold/80">{dish.rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Circular Checkbox Small */}
                    {!dish.isSoldOut && (
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ml-2",
                                isSelected
                                    ? "bg-accent-gold text-background shadow-gold"
                                    : "bg-white/5 border border-white/10 text-white/20 hover:text-white hover:border-white/30"
                            )}
                        >
                            <Check size={16} strokeWidth={isSelected ? 4 : 2} />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between mb-2">
                    <span className="font-sans font-bold text-[15px] text-accent-gold tracking-tight">{formatPrice(dish.price)}</span>
                    <div className="flex gap-1.5">
                        {renderBadges()}
                    </div>
                </div>
                <p className="text-text-secondary text-[12px] leading-snug line-clamp-2 italic opacity-60">{dish.description}</p>
            </div>
        </div>
    );
}
