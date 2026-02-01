"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Dish, BadgeObject } from "./MenuItem";
import { 
    Star, Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat, CircleHelp
} from "lucide-react";

const LucideIconMap: Record<string, any> = {
    Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat
};

interface FeaturedCarouselProps {
    dishes: Dish[];
    onSelect: (dish: Dish) => void;
    lang: "FR" | "EN";
}

export default function FeaturedCarousel({ dishes, onSelect, lang }: FeaturedCarouselProps) {
    if (dishes.length === 0) return null;

    const renderBadges = (dish: Dish) => {
        if (dish.badgeObjects && dish.badgeObjects.length > 0) {
            return dish.badgeObjects.map((b) => {
                const iconColor = b.color || '#D4AF37';
                
                if (b.iconType === 'image' && b.iconUrl) {
                    return (
                        <div key={b.key || b.label} className="w-[14px] h-[14px] relative opacity-90" title={b.label}>
                            <Image src={b.iconUrl} alt={b.label} fill className="object-contain" />
                        </div>
                    );
                } 
                
                if (b.iconType === 'lucide' && b.lucideIcon) {
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

                return null;
            });
        }
        return null;
    };

    return (
        <div className="mb-0">
            <div className="px-4 mb-3 flex items-center gap-2">
                <Star size={16} className="text-accent-gold fill-accent-gold" />
                <h2 className="font-display font-bold text-xl text-white italic">
                    {lang === "EN" ? "Chef's Suggestions" : "Les Suggestions du Chef"}
                </h2>
            </div>
            
            <div className="flex overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory gap-4 px-4">
                {dishes.map((dish) => (
                    <motion.div
                        key={dish.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(dish)}
                        className="flex-none w-[280px] snap-start bg-surface border border-white/5 rounded-[32px] overflow-hidden group"
                    >
                        <div className="relative h-44 w-full">
                            <Image
                                src={dish.image}
                                alt={dish.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            
                            {/* Badges on top left of image */}
                            <div className="absolute top-4 left-4 flex gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                                {renderBadges(dish)}
                            </div>

                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-white font-display font-bold text-lg leading-tight line-clamp-1 italic">
                                    {lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title}
                                </h3>
                                <p className="text-accent-gold font-bold">{dish.price} F</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}