"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CategoryNavProps {
    categories: string[];
    onCategoryChange?: (cat: string) => void;
    activeCategory?: string;
    lang?: "FR" | "EN";
    categoryTranslations?: Record<string, string>;
}

export default function CategoryNav({
    categories,
    onCategoryChange,
    activeCategory: externalActive,
    lang = "FR",
    categoryTranslations
}: CategoryNavProps) {
    const [internalActive, setInternalActive] = useState(categories[0] || "");
    const active = externalActive || internalActive;

    const handleCategoryClick = (cat: string) => {
        setInternalActive(cat);
        if (onCategoryChange) onCategoryChange(cat);

        const id = cat.toLowerCase();
        const element = document.getElementById(id);
        if (element) {
            const offset = 140;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="sticky top-16 z-40 bg-background">
            <div className="flex px-4 items-center gap-8 border-b border-border overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={cn(
                            "py-4 text-[15px] font-medium transition-all relative whitespace-nowrap",
                            active === cat ? "text-accent-gold" : "text-text-secondary"
                        )}
                    >
                        {lang === "EN" && categoryTranslations?.[cat] ? categoryTranslations[cat] : cat}
                        {active === cat && (
                            <motion.div
                                layoutId="activeCategory"
                                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-accent-gold rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
