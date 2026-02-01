"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Trash2, Plus, Minus, MessageSquare, Star, Heart, RefreshCw, BookmarkCheck, History, Save } from "lucide-react";
import Image from "next/image";
import { Dish } from "./MenuItem";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface SelectionSummaryProps {
    isOpen: boolean;
    cart: Record<string, number>;
    dishes: Dish[]; 
    onClose: () => void;
    onUpdateQuantity: (dishId: string, delta: number) => void;
    lang?: "FR" | "EN";
}

export default function SelectionSummary({ isOpen, cart, dishes, onClose, onUpdateQuantity, lang = "FR" }: SelectionSummaryProps) {
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);
    
    const selectedDishes = dishes.filter(d => (cart[d.id] || 0) > 0);
    
    const totalPrice = selectedDishes.reduce((sum, dish) => {
        return sum + (dish.price * (cart[dish.id] || 0));
    }, 0);

    const formatPrice = (price: number) => {
        return price.toLocaleString("fr-FR").replace(/\s/g, "\u00A0") + "\u00A0F";
    };

    const handleWhatsAppSend = () => {
        let text = lang === "EN" 
            ? "Hello! Here is my selection from the menu:\n\n" 
            : "Bonjour ! Voici ma sélection depuis le menu :\n\n";
            
        selectedDishes.forEach(dish => {
            const qty = cart[dish.id];
            const title = lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title;
            text += `• ${qty}x ${title} (${formatPrice(dish.price * qty)})\n`;
        });
        
        text += `\n*Total : ${formatPrice(totalPrice)}*`;
        
        const encodedText = encodeURIComponent(text);
        const phoneNumber = "221772354747";
        window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
    };

    const handleSaveSelection = async () => {
        if (!session?.user?.email) return;
        if (!showNameInput) {
            setShowNameInput(true);
            return;
        }
        
        setIsSaving(true);
        
        try {
            const { error } = await supabase.from('saved_selections').insert({
                user_email: session.user.email,
                name: saveName || (lang === "EN" ? "My Selection" : "MaSélection"),
                total_price: totalPrice,
                items: selectedDishes.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    qty: cart[d.id],
                    price: d.price
                }))
            });

            if (error) throw error;

            alert(lang === "EN" ? "Selection saved to the cloud!" : "Sélection sauvegardée sur le cloud !");
            setShowNameInput(false);
            setSaveName("");
        } catch (error: any) {
            console.error("Supabase Save Error:", error);
            alert(lang === "EN" ? "Error: " + error.message : "Erreur: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[115] flex items-end justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-surface rounded-t-[40px] shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-text-secondary/20 rounded-full z-20" />

                        <div className="px-8 pt-10 pb-6 flex justify-between items-center border-b border-border">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="text-accent-gold" size={24} />
                                <h2 className="font-display font-bold text-2xl text-text-primary italic">
                                    {lang === "EN" ? "My Selection" : "MaSélection"}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
                            {selectedDishes.length > 0 ? (
                                <>
                                    <div className="flex justify-between items-center px-2">
                                        <Link 
                                            href="/dashboard" 
                                            onClick={onClose}
                                            className="bg-accent-gold/10 text-accent-gold px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-accent-gold/20 transition-all border border-accent-gold/20"
                                        >
                                            <History size={14} />
                                            {lang === "EN" ? "History" : "Mes Sauvegardes"}
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                if(confirm(lang === "EN" ? "Clear selection?" : "Vider la sélection ?")) {
                                                    Object.keys(cart).forEach(id => {
                                                        if (cart[id] > 0) onUpdateQuantity(id, -cart[id]);
                                                    });
                                                }
                                            }}
                                            className="text-[11px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            {lang === "EN" ? "Clear" : "Tout vider"}
                                        </button>
                                    </div>
                                    {selectedDishes.map(dish => (
                                        <div key={dish.id} className="flex items-center gap-4 group">
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-border">
                                                <Image src={dish.image} alt={dish.title} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-display font-semibold text-text-primary text-[16px] mb-0.5">
                                                    {lang === "EN" && dish.translations?.en ? dish.translations.en.title : dish.title}
                                                </h4>
                                                <p className="text-[13px] text-accent-gold font-bold">{formatPrice(dish.price)}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 bg-text-primary/5 rounded-full p-1 border border-border">
                                                <button 
                                                    onClick={() => onUpdateQuantity(dish.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center text-text-primary/40"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-text-primary font-bold text-sm min-w-[12px] text-center">{cart[dish.id]}</span>
                                                <button 
                                                    onClick={() => onUpdateQuantity(dish.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-accent-gold"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-text-secondary font-medium">Total</span>
                                            <span className="text-2xl font-bold text-text-primary">{formatPrice(totalPrice)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20 opacity-30 text-text-primary italic">
                                    <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>{lang === "EN" ? "Your selection is empty" : "Aucun plat dans votre sélection"}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-8 pb-10 pt-6 space-y-3">
                            {selectedDishes.length > 0 && (
                                <>
                                    {showNameInput && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-2"
                                        >
                                            <input 
                                                autoFocus
                                                type="text" 
                                                placeholder={lang === "EN" ? "Name this selection..." : "Nommez cette sélection..."}
                                                value={saveName}
                                                onChange={(e) => setSaveName(e.target.value)}
                                                className="w-full bg-text-primary/5 border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-primary/20 focus:border-accent-gold outline-none transition-all"
                                            />
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleWhatsAppSend}
                                        className="w-full bg-[#25D366] text-white font-bold h-[60px] rounded-[22px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-[15px] uppercase"
                                    >
                                        <MessageSquare size={20} fill="currentColor" />
                                        <span className="tracking-wider">WhatsApp</span>
                                    </button>

                                    {session ? (
                                        <button
                                            onClick={handleSaveSelection}
                                            disabled={isSaving}
                                            className="w-full bg-accent-gold text-background font-bold h-[60px] rounded-[22px] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-gold"
                                        >
                                            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                            <span className="uppercase tracking-wider text-[14px]">
                                                {showNameInput 
                                                    ? (lang === "EN" ? "Confirm Save" : "Confirmer la sauvegarde") 
                                                    : (lang === "EN" ? "Save to Cloud" : "Sauvegarder sur le Cloud")}
                                            </span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => signIn()}
                                            className="w-full bg-text-primary/5 border border-border text-text-primary/70 font-bold h-[56px] rounded-[22px] flex items-center justify-center gap-3 active:scale-95 transition-all"
                                        >
                                            <Heart size={18} />
                                            <span className="uppercase tracking-wider text-[14px]">
                                                {lang === "EN" ? "Login to Save" : "Se connecter pour sauvegarder"}
                                            </span>
                                        </button>
                                    )}
                                </>
                            )}
                            
                            <button
                                onClick={onClose}
                                className="w-full h-[40px] text-text-secondary/70 text-[12px] uppercase tracking-widest font-bold"
                            >
                                {lang === "EN" ? "Close" : "Fermer"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
