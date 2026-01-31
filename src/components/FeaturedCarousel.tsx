"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Dish } from "./MenuItem";
import { Star } from "lucide-react";

interface FeaturedCarouselProps {
    dishes: Dish[];
    onSelect: (dish: Dish) => void;
    lang: "FR" | "EN";
}

export default function FeaturedCarousel({ dishes, onSelect, lang }: FeaturedCarouselProps) {
    if (dishes.length === 0) return null;

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
                        <div className="relative h-40 w-full">
                            <Image
                                src={dish.image}
                                alt={dish.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{dish.title}</h3>
                                <p className="text-accent-gold font-bold">{dish.price} F</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
