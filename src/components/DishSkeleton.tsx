"use client";

import { motion } from "framer-motion";

export default function DishSkeleton() {
  return (
    <div className="relative bg-surface/50 p-3.5 rounded-[24px] flex gap-4 border border-white/5 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-[100px] h-[100px] shrink-0 rounded-[20px] bg-white/5 overflow-hidden" />

      {/* Content Skeleton */}
      <div className="flex-1 py-1 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-5 w-3/4 bg-white/5 rounded-md" />
          <div className="h-8 w-8 rounded-full bg-white/5" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/4 bg-accent-gold/10 rounded-md" />
          <div className="flex gap-1.5">
            <div className="h-4 w-4 rounded-full bg-white/5" />
            <div className="h-4 w-4 rounded-full bg-white/5" />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/5 rounded-md" />
          <div className="h-3 w-2/3 bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedDishSkeleton() {
  return (
    <div className="relative bg-surface/50 rounded-[24px] overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[1.5] w-full bg-white/5" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-7 w-1/2 bg-white/5 rounded-md" />
          <div className="h-6 w-1/4 bg-accent-gold/10 rounded-md" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/5 rounded-md" />
          <div className="h-4 w-3/4 bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}
