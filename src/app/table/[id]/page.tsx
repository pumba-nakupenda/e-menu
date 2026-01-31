"use client";

import { useState, useMemo, useEffect, use, Suspense } from "react";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import FilterBar from "@/components/FilterBar";
import MenuItem, { Dish } from "@/components/MenuItem";
import DishBottomSheet from "@/components/DishBottomSheet";
import SelectionBar from "@/components/SelectionBar";
import SelectionSummary from "@/components/SelectionSummary";
import WaiterCallModal from "@/components/WaiterCallModal";
import SearchOverlay from "@/components/SearchOverlay";
import DishSkeleton, { FeaturedDishSkeleton } from "@/components/DishSkeleton";
import { mockDishes as localMockDishes } from "@/data/menu";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

export default function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tableNumber = resolvedParams.id;

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isSelectionSummaryOpen, setIsSelectionSummaryOpen] = useState(false);
  const [lang, setLang] = useState<"FR" | "EN">("FR");

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Entrées");
  const [sectionFilters, setSectionFilters] = useState<Record<string, string>>({});
  const [categoryTranslations, setCategoryTranslations] = useState<Record<string, string>>({});
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [hasActiveCall, setHasActiveCall] = useState(false);

  useEffect(() => {
    const fetchActiveCall = async () => {
        const data = await client.fetch(`*[_type == "notification" && tableNumber == $table && status != "done"][0]`, { table: tableNumber });
        setHasActiveCall(!!data);
    };
    fetchActiveCall();

    const subscription = client.listen(`*[_type == "notification" && tableNumber == $table]`, { table: tableNumber }, { includeResult: true })
        .subscribe((update: any) => {
            const { transition, result } = update;
            if (transition === 'appear') {
                setHasActiveCall(true);
            }
            if (transition === 'update') {
                setHasActiveCall(result.status !== 'done');
            }
            if (transition === 'disappear') {
                setHasActiveCall(false);
            }
        });

    return () => subscription.unsubscribe();
  }, [tableNumber]);

  useEffect(() => {
    async function fetchData() {
      try {
        const query = `
          {
            "sanityDishes": *[_type == "dish"] {
              "id": _id, title, description, price, image, "category": category->title, badges,
              "dietaryBadges": dietaryBadges[]->{title, titleEn, "icon": icon.asset->url, emoji, lucideIcon, iconType, isOutline, color, "key": _id},
              "ingredientBadges": ingredientBadges[]->{title, titleEn, "icon": icon.asset->url, emoji, lucideIcon, iconType, isOutline, color, "key": _id},
              "dessertBadges": dessertBadges[]->{title, titleEn, "icon": icon.asset->url, emoji, lucideIcon, iconType, isOutline, color, "key": _id},
              "drinkBadges": drinkBadges[]->{title, titleEn, "icon": icon.asset->url, emoji, lucideIcon, iconType, isOutline, color, "key": _id},
              isFeatured, isSoldOut, rating, "translations": { "en": en }, storyFr
            },
            "sanityCategories": *[_type == "category"] | order(order asc) { title, titleEn }
          }
        `;
        const data = await client.fetch(query);
        const mappedDishes = data.sanityDishes.map((d: any) => {
          const rawBadges = [...(d.dietaryBadges || []), ...(d.ingredientBadges || []), ...(d.dessertBadges || []), ...(d.drinkBadges || [])];
          const badgeObjects = rawBadges.map((b: any) => ({
             key: b.key, label: b.title, labelEn: b.titleEn || b.title, iconUrl: b.icon, emoji: b.emoji, lucideIcon: b.lucideIcon, iconType: b.iconType || 'emoji', isOutline: b.isOutline || false, color: b.color, category: "DYNAMIC" 
          }));
          return { 
            ...d, 
            image: d.image ? urlFor(d.image).width(600).height(400).format('webp').url() : "", 
            badgeObjects: badgeObjects.length > 0 ? badgeObjects : undefined 
          };
        });

        const catNames = data.sanityCategories.map((c: any) => c.title);
        const catTrans: Record<string, string> = {};
        data.sanityCategories.forEach((c: any) => { if (c.titleEn) catTrans[c.title] = c.titleEn; });

        if (mappedDishes.length > 0) {
          setDishes(mappedDishes);
          setCategories(catNames);
          setCategoryTranslations(catTrans);
          if (catNames.length > 0) {
            setActiveCategory(catNames[0]);
            const initialFilters: Record<string, string> = {};
            catNames.forEach((cat: string) => { initialFilters[cat] = "Tout"; });
            setSectionFilters(initialFilters);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const badgeToFilterMap: Record<string, { fr: string; en: string }> = {
    'VEGAN': { fr: 'Vegan', en: 'Vegan' }, 'GLUTEN_FREE': { fr: 'Sans Gluten', en: 'Gluten Free' },
    'SPICY': { fr: 'Épicé', en: 'Spicy' }, 'MER': { fr: 'Mer', en: 'Seafood' },
    'VIANDES': { fr: 'Viandes', en: 'Meat' }, 'POISSONS': { fr: 'Poissons', en: 'Fish' },
  };

  const domainFilters = useMemo(() => {
    const filters: Record<string, Set<string>> = {};
    categories.forEach(cat => {
      filters[cat] = new Set(['Tout']);
      dishes.filter(d => d.category === cat).forEach(dish => {
        if (dish.badgeObjects) dish.badgeObjects.forEach(b => filters[cat].add(b.label));
        else dish.badges?.forEach(badge => { if (badgeToFilterMap[badge]) filters[cat].add(badgeToFilterMap[badge].fr); });
      });
    });
    return Object.fromEntries(Object.entries(filters).map(([cat, set]) => [cat, Array.from(set)]));
  }, [dishes, categories]);

  const filterTranslations = useMemo(() => {
    const trans: Record<string, string> = { 'Tout': 'All' };
    dishes.forEach(d => d.badgeObjects?.forEach(b => trans[b.label] = b.labelEn || b.label));
    Object.values(badgeToFilterMap).forEach(({ fr, en }) => trans[fr] = en);
    return trans;
  }, [dishes]);

  const allFilterIcons = useMemo(() => {
      const icons: Record<string, any> = {};
      dishes.forEach(d => d.badgeObjects?.forEach(b => { icons[b.label] = b; if (b.labelEn) icons[b.labelEn] = b; }));
      return icons;
  }, [dishes]);

  const allBadgeFilters = useMemo(() => {
      const badges = new Set<string>();
      dishes.forEach(d => d.badgeObjects?.forEach(b => badges.add(b.label)));
      return Array.from(badges);
  }, [dishes]);

  const handleToggleSelection = (dish: Dish) => {
    setSelectedDishIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dish.id)) newSet.delete(dish.id);
      else newSet.add(dish.id);
      return newSet;
    });
  };

  const handleCallWaiter = async (type: 'waiter' | 'bill' = 'waiter') => {
    if (isCallingWaiter) return;
    
    // --- GESTION DU DOUBLON (ZEN MODE) ---
    if (hasActiveCall) {
        setIsWaiterModalOpen(true); // On ré-affiche la modale en mode "Rappel"
        return;
    }

    setIsWaiterModalOpen(true);
    setIsSelectionSummaryOpen(false);

    try {
      setIsCallingWaiter(true);
      const res = await fetch('/api/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, type }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Détails techniques:", data);
        throw new Error(data.message || data.error || "Erreur inconnue");
      }
      
      console.log("Appel réussi");
    } catch (err: any) {
      console.error("Échec de l'appel:", err);
      setHasActiveCall(false); 
    } finally {
      setIsCallingWaiter(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} lang={lang} onLangChange={setLang} tableNumber={tableNumber} hasActiveCall={hasActiveCall} />

      <section className="relative h-[35vh] w-full overflow-hidden flex items-center justify-center pt-16">
        <Image src="/images/hero.png" alt="Hero" fill className="object-cover opacity-60 scale-110" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display font-bold text-[42px] leading-tight text-white italic mb-2 tracking-tight">
              {lang === "EN" ? "Gastronomic Excellence" : "L'Excellence Gastronomique"}
            </h1>
            <p className="text-accent-gold font-sans font-bold tracking-[0.4em] uppercase text-[10px]">Table {tableNumber}</p>
          </motion.div>
        </div>
      </section>

      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-white/5">
        <CategoryNav categories={categories.length > 0 ? categories : ["Entrées", "Plats", "Desserts"]} activeCategory={activeCategory} onCategoryChange={setActiveCategory} lang={lang} categoryTranslations={categoryTranslations} />
      </div>

      <div className="container mx-auto px-4 mt-2 min-h-[40vh]">
        {isLoading ? (
          <div className="space-y-8 pt-4">
            <div className="flex justify-between items-baseline border-l-2 border-accent-gold/20 pl-4 opacity-50">
                <div className="h-10 w-48 bg-white/5 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeaturedDishSkeleton />
                <DishSkeleton />
                <DishSkeleton />
                <DishSkeleton />
                <DishSkeleton />
                <DishSkeleton />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {categories.filter(cat => cat === activeCategory).map((catName) => {
            const currentFilter = sectionFilters[catName] || "Tout";
            const categoryDishes = dishes.filter((d) => {
              if (d.category !== catName) return false;
              if (currentFilter === "Tout") return true;
              return d.badgeObjects?.some(b => b.label === currentFilter) || false;
            });

            return (
              <motion.section key={catName} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex justify-between items-baseline border-l-2 border-accent-gold pl-4">
                  <h2 className="font-display font-bold text-[36px] text-white italic">{lang === "EN" ? (categoryTranslations[catName] || catName) : catName}</h2>
                </div>
                <FilterBar filters={lang === "EN" ? (domainFilters[catName] || ["Tout"]).map(f => filterTranslations[f] || f) : (domainFilters[catName] || ["Tout"])} activeFilter={lang === "EN" ? filterTranslations[currentFilter] : currentFilter} icons={allFilterIcons} onFilterChange={(f) => setSectionFilters(prev => ({ ...prev, [catName]: lang === "EN" ? Object.keys(filterTranslations).find(k => filterTranslations[k] === f) || f : f }))} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                  {categoryDishes.map((dish) => (
                    <MenuItem key={dish.id} dish={{...dish, title: lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title, description: lang === "EN" && dish.translations?.en ? dish.translations.en.description : dish.description}} isSelected={selectedDishIds.has(dish.id)} onToggle={handleToggleSelection} onShowDetails={(d) => { setSelectedDish(d); setIsBottomSheetOpen(true); }} />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
        )}
      </div>

      <DishBottomSheet dish={selectedDish} isOpen={isBottomSheetOpen} isSelected={!!selectedDish && selectedDishIds.has(selectedDish.id)} onClose={() => setIsBottomSheetOpen(false)} onToggleSelection={handleToggleSelection} lang={lang} />
      <SearchOverlay isOpen={isSearchOpen} selectedIds={selectedDishIds} dishes={dishes} categories={categories} onClose={() => setIsSearchOpen(false)} onSelectDish={(d) => { setIsSearchOpen(false); setSelectedDish(d); setIsBottomSheetOpen(true); }} onToggleDish={handleToggleSelection} lang={lang} categoryTranslations={categoryTranslations} allBadgeFilters={allBadgeFilters} badgeIcons={allFilterIcons} />
      <WaiterCallModal isOpen={isWaiterModalOpen} onClose={() => setIsWaiterModalOpen(false)} lang={lang} tableNumber={tableNumber} isReminder={hasActiveCall} />
      <SelectionSummary isOpen={isSelectionSummaryOpen} selectedIds={selectedDishIds} dishes={dishes} onClose={() => setIsSelectionSummaryOpen(false)} onRemove={(id) => setSelectedDishIds(prev => { const n = new Set(prev); n.delete(id); return n; })} onCallWaiter={() => { handleCallWaiter('waiter'); setIsSelectionSummaryOpen(false); setIsWaiterModalOpen(true); }} lang={lang} />
      <SelectionBar itemCount={selectedDishIds.size} onCallWaiter={() => { handleCallWaiter('waiter'); setIsWaiterModalOpen(true); }} onViewSelection={() => setIsSelectionSummaryOpen(true)} lang={lang} />

      <footer className="container mx-auto px-6 py-20 border-t border-white/5 mt-20 text-center text-white/40">
        <div className="font-display italic text-2xl mb-6 text-accent-gold">E-MENU</div>
        <div className="flex justify-center gap-6 mb-10">
          <a href="#" className="hover:text-accent-gold transition-colors">Instagram</a>
          <a href="#" className="hover:text-accent-gold transition-colors">Facebook</a>
        </div>
        <div className="space-y-2 opacity-40">
          <p className="text-sm">123 Rue du Gourmet, 75001 Paris</p>
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-accent-gold">
            Ouvert 7j/7 : 12h00 - 23h30
          </p>
          <div className="pt-8 text-[9px] tracking-widest uppercase">
            © 2026 E-MENU. Développé par LOLLY SAS. Tous droits réservés.
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-40" />
    </main>
  );
}