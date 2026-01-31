"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { BadgeObject } from "./MenuItem";
import { 
    Check, Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Info, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat, CircleHelp, Filter 
} from "lucide-react";

// Map of available icons for Sanity dynamic selection (Duplicate from MenuItem for self-containment)
const LucideIconMap: Record<string, any> = {
    Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan, ChefHat
};

interface FilterBarProps {
    filters: string[];
    activeFilter?: string;
    onFilterChange?: (filter: string) => void;
    icons?: Record<string, BadgeObject>; // Map filter name -> Badge Icon Data
}

const LegacyFilterIcon = ({ filter }: { filter: string }) => {
    const f = filter.toLowerCase();
    if (f.includes("végé") || f.includes("vege")) return <Leaf size={14} />;
    if (f.includes("mer") || f.includes("sea")) return <Waves size={14} />;
    if (f.includes("terre") || f.includes("meat") || f.includes("viande")) return <Beef size={14} />;
    if (f.includes("fish") || f.includes("poisson")) return <Fish size={14} />;
    if (f.includes("choco")) return <Candy size={14} />;
    if (f.includes("fruit") || f.includes("cherry")) return <Cherry size={14} />;
    if (f.includes("vin") || f.includes("rouge") || f.includes("blanc") || f.includes("wine") || f.includes("red") || f.includes("white")) return <Wine size={14} />;
    if (f.includes("cocktail") || f.includes("mix")) return <Martini size={14} />;
    if (f.includes("digestif") || f.includes("liqueur") || f.includes("cognac")) return <Wine size={14} />;
    if (f.includes("soft") || f.includes("boisson") || f.includes("drink")) return <GlassWater size={14} />;
    if (f.includes("bulle") || f.includes("bubble")) return <Sparkles size={14} />;
    if (f.includes("tout") || f.includes("all")) return <Filter size={14} />;
    return null;
};

export default function FilterBar({ filters, activeFilter, onFilterChange, icons }: FilterBarProps) {
    const handleFilterClick = (filter: string) => {
        if (onFilterChange) {
            onFilterChange(filter);
        }
    };

    const renderIcon = (filter: string) => {
        // 1. Try dynamic icon from props
        if (icons && icons[filter]) {
            const b = icons[filter];
            const iconColor = b.color || '#D4AF37';

            if (b.iconType === 'image' && b.iconUrl) {
                return (
                    <div className="w-[14px] h-[14px] relative opacity-90">
                        <Image src={b.iconUrl} alt={filter} fill className="object-contain" />
                    </div>
                );
            }

            if (b.iconType === 'lucide' && b.lucideIcon) {
                const cleanName = b.lucideIcon.trim();
                const IconComponent = LucideIconMap[cleanName] || LucideIconMap[cleanName.charAt(0).toUpperCase() + cleanName.slice(1)] || CircleHelp;
                return (
                    <IconComponent 
                        size={14} 
                        strokeWidth={b.isOutline ? 1.5 : 2.5} 
                        style={{ color: iconColor }}
                    />
                );
            }

            if (b.emoji) {
                 return (
                    <span 
                        className="text-[14px] leading-none" 
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
        }

        // 2. Fallback to legacy
        return <LegacyFilterIcon filter={filter} />;
    };

    return (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-4 -my-2 px-2">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-[12px] font-bold border transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                        activeFilter === filter
                            ? "bg-accent-gold border-accent-gold text-background shadow-[0_4px_15px_rgba(212,175,55,0.4)] scale-105"
                            : "bg-white/5 border-white/5 text-text-secondary hover:border-white/20"
                    )}
                >
                    {renderIcon(filter)}
                    {filter}
                </button>
            ))}
        </div>
    );
}
