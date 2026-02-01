"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
    Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat, 
    Star, 
    CircleHelp,
    Plus,
    Minus,
    Heart,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";

const LucideIconMap: Record<string, any> = {
    Leaf, Flame, Wheat, Waves, Beef, Fish, Candy, Cherry, Wine, GlassWater, Sparkles, Martini, CakeSlice, IceCreamCone, Nut, Coffee, Beer,
    Utensils, Pizza, Apple, Carrot, Egg, Milk, Croissant, Drumstick, Soup, Sandwich, Citrus, Grape, Vegan,
    ChefHat 
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
    badges?: string[]; 
    badgeObjects?: BadgeObject[]; 
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
    quantity: number;
    onUpdateQuantity: (delta: number) => void;
    onShowDetails: (dish: Dish) => void;
}

const DishIcons = ({ badge }: { badge: string }) => {
    switch (badge) {
        case "VEGAN": return <Leaf size={14} className="text-green-600/80" />;
        case "GLUTEN_FREE": return <Wheat size={14} className="text-amber-500/80" />;
        case "SPICY": return <Flame size={14} className="text-red-500/80" />;
        default: return null;
    }
};

export default function MenuItem({ dish, quantity, onUpdateQuantity, onShowDetails }: MenuItemProps) {
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            if (!session?.user?.email) return;
            const { data } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_email', session.user.email)
                .eq('dish_id', dish.id)
                .single();
            if (data) setIsFavorite(true);
        };
        checkFavorite();
    }, [session, dish.id]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session?.user?.email) {
            // Au lieu d'une alerte, on propose la connexion
            signIn();
            return;
        }

        if (isFavorite) {
            await supabase.from('favorites').delete().eq('user_email', session.user.email).eq('dish_id', dish.id);
            setIsFavorite(false);
        } else {
            await supabase.from('favorites').insert({ user_email: session.user.email, dish_id: dish.id });
            setIsFavorite(true);
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString("fr-FR").replace(/\s/g, "\u00A0") + "\u00A0F";
    };

    const renderBadges = () => {
        if (dish.badgeObjects && dish.badgeObjects.length > 0) {
            return dish.badgeObjects.map((b: any) => {
                const iconColor = b.color || '#D4AF37';
                if (b.iconType === 'image' && b.iconUrl) return <div key={b.key || b.label} className="w-[14px] h-[14px] relative opacity-80" title={b.label}><Image src={b.iconUrl} alt={b.label} fill className="object-contain" /></div>;
                if (b.iconType === 'lucide' && b.lucideIcon) {
                    const cleanName = b.lucideIcon.trim();
                    const IconComponent = LucideIconMap[cleanName] || LucideIconMap[cleanName.charAt(0).toUpperCase() + cleanName.slice(1)] || CircleHelp;
                    return <IconComponent key={b.key || b.label} size={14} strokeWidth={b.isOutline ? 1.5 : 2.5} style={{ color: iconColor }} className="opacity-90" title={b.label} />;
                }
                if (b.emoji) return <span key={b.key || b.label} className="text-[14px] leading-none" title={b.label} style={b.isOutline ? { color: 'transparent', WebkitTextStroke: `1px ${iconColor}` } : { color: 'transparent', textShadow: `0 0 0 ${iconColor}` }}>{b.emoji}</span>;
                return <DishIcons key={b.key} badge={b.key} />;
            });
        }
        return dish.badges?.map(b => <DishIcons key={b} badge={b} />);
    };

    const QuantityControls = ({ isSmall = false }) => (
        <div className={cn("flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/20 p-1", isSmall ? "gap-2" : "gap-3")}>
            {quantity > 0 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(-1); }} className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"><Minus size={isSmall ? 14 : 16} /></button>
                    <span className="text-white font-bold text-[14px] min-w-[12px] text-center">{quantity}</span>
                </>
            )}
            <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(1); }} className={cn("rounded-full flex items-center justify-center transition-all", quantity > 0 ? "w-7 h-7 text-accent-gold" : "w-8 h-8 bg-accent-gold text-background shadow-gold")}><Plus size={isSmall ? 14 : 16} strokeWidth={3} /></button>
        </div>
    );

    if (dish.isFeatured) {
        return (
            <div onClick={() => onShowDetails(dish)} className="relative bg-surface rounded-[24px] overflow-hidden group cursor-pointer border border-white/5 hover:border-accent-gold/40 transition-all duration-300">
                <div className="relative aspect-[1.5] w-full">
                    <Image src={dish.image} alt={dish.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-accent-gold px-3 py-1 rounded-full"><span className="text-[10px] font-bold text-background tracking-wider uppercase italic">Chef's Choice</span></div>
                        <button onClick={toggleFavorite} className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-accent-gold transition-transform active:scale-125">
                            <motion.div
                                animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                            </motion.div>
                        </button>
                    </div>
                    <div className="absolute top-4 right-4"><QuantityControls /></div>
                </div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-display font-semibold text-[22px] text-white tracking-tight">{dish.title}</h3>
                            {dish.rating && <div className="flex items-center gap-1"><Star size={12} className="fill-accent-gold text-accent-gold" /><span className="text-[12px] font-bold text-accent-gold/80">{dish.rating}</span></div>}
                        </div>
                        <div className="flex flex-col items-end"><span className="font-sans font-bold text-[18px] text-accent-gold tracking-tight">{formatPrice(dish.price)}</span><div className="flex gap-1.5 mt-1">{renderBadges()}</div></div>
                    </div>
                    <p className="text-text-secondary text-[14px] leading-relaxed line-clamp-2 opacity-80">{dish.description}</p>
                </div>
            </div>
        );
    }

    return (
        <div onClick={() => !dish.isSoldOut && onShowDetails(dish)} className={cn("relative bg-surface p-3.5 rounded-[24px] flex gap-4 transition-all duration-300 border border-white/5", dish.isSoldOut ? "opacity-40 grayscale pointer-events-none" : "hover:border-accent-gold/20 cursor-pointer")}>
            <div className="relative w-[100px] h-[100px] shrink-0 rounded-[20px] overflow-hidden">
                <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                {dish.isSoldOut && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-white border border-white/10">ÉPUISÉ</span></div>}
            </div>
            <div className="flex-1 py-1">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="font-display font-semibold text-[17px] text-white tracking-tight line-clamp-1">{dish.title}</h3>
                        <div className="flex items-center gap-2">
                            {dish.rating && <div className="flex items-center gap-1"><Star size={10} className="fill-accent-gold text-accent-gold" /><span className="text-[10px] font-bold text-accent-gold/80">{dish.rating}</span></div>}
                            <button onClick={toggleFavorite} className="text-accent-gold/40 hover:text-accent-gold transition-all active:scale-125">
                                <motion.div
                                    animate={isFavorite ? { scale: [1, 1.4, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
                                </motion.div>
                            </button>
                        </div>
                    </div>
                    {!dish.isSoldOut && <div className="ml-2"><QuantityControls isSmall /></div>}
                </div>
                <div className="flex items-center justify-between mb-2"><span className="font-sans font-bold text-[15px] text-accent-gold tracking-tight">{formatPrice(dish.price)}</span><div className="flex gap-1.5">{renderBadges()}</div></div>
                <p className="text-text-secondary text-[12px] leading-snug line-clamp-2 italic opacity-60">{dish.description}</p>
            </div>
        </div>
    );
}
