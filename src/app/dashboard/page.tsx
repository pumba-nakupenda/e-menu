"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Bookmark, Clock, Trash2, ChevronLeft, MessageSquare, Edit2, Check, X, Heart, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

interface SavedItem {
    id: string;
    title: string;
    qty: number;
    price: number;
}

interface SavedSelection {
    id: string;
    date: string;
    name: string;
    total_price: number;
    items: SavedItem[];
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [history, setHistory] = useState<SavedSelection[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setSaveName] = useState("");
    const [lang, setLang] = useState<"FR" | "EN">("FR");
    const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

    useEffect(() => {
        if (status === "unauthenticated") router.push("/");
    }, [status, router]);

    const fetchData = async () => {
        if (!session?.user?.email) return;
        setIsLoading(true);
        try {
            // 1. Fetch History
            const { data: historyData } = await supabase.from('saved_selections').select('*').eq('user_email', session.user.email).order('created_at', { ascending: false });
            setHistory(historyData?.map((d: any) => ({ id: d.id, date: d.created_at, name: d.name, total_price: d.total_price, items: d.items })) || []);

            // 2. Fetch Favorites IDs
            const { data: favsData } = await supabase.from('favorites').select('dish_id').eq('user_email', session.user.email);
            if (favsData && favsData.length > 0) {
                const favIds = favsData.map((f: any) => f.dish_id);
                const sanityFavs = await client.fetch(`*[_type == "dish" && _id in $ids] { _id, title, price, image }`, { ids: favIds });
                setFavorites(sanityFavs.map((f: any) => ({
                    id: f._id,
                    title: f.title,
                    price: f.price,
                    image: f.image ? urlFor(f.image).width(200).height(200).url() : ""
                })));
            }
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (status === "authenticated") fetchData();
    }, [status, session]);

    const deleteEntry = async (id: string) => {
        if (!confirm("Supprimer ?")) return;
        await supabase.from('saved_selections').delete().eq('id', id);
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    const removeFavorite = async (id: string) => {
        await supabase.from('favorites').delete().eq('user_email', session?.user?.email).eq('dish_id', id);
        setFavorites(prev => prev.filter(f => f.id !== id));
    };

    const updateName = async (id: string) => {
        await supabase.from('saved_selections').update({ name: editName }).eq('id', id);
        setHistory(prev => prev.map(h => h.id === id ? { ...h, name: editName } : h));
        setEditingId(null);
    };

    const shareAgain = (entry: SavedSelection) => {
        let text = `Bonjour ! Je repartage ma sélection "${entry.name}" :\n\n`;
        entry.items.forEach(item => { text += `• ${item.qty}x ${item.title} (${item.price * item.qty} F)\n`; });
        text += `\n*Total : ${entry.total_price} F*`;
        window.open(`https://wa.me/221772354747?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (status === "loading" || isLoading) return null;

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar onSearchClick={() => {}} lang={lang} onLangChange={setLang} />
            <div className="container mx-auto px-4 mt-28">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white"><ChevronLeft size={20} /></Link>
                        <div>
                            <h1 className="font-display font-bold text-3xl text-white italic">Mon E-Space</h1>
                            <p className="text-text-secondary text-sm">{session?.user?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-white/5 p-1 rounded-2xl">
                    <button onClick={() => setActiveTab('history')} className={cn("flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all", activeTab === 'history' ? "bg-accent-gold text-background" : "text-white/40")}><History size={16} /> Historique</button>
                    <button onClick={() => setActiveTab('favorites')} className={cn("flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all", activeTab === 'favorites' ? "bg-accent-gold text-background" : "text-white/40")}><Heart size={16} /> Favoris</button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'history' ? (
                        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {history.length > 0 ? history.map((entry) => (
                                <div key={entry.id} className="bg-surface border border-white/5 rounded-[32px] p-6 space-y-4 shadow-xl">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            {editingId === entry.id ? (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <input autoFocus value={editName} onChange={(e) => setSaveName(e.target.value)} className="bg-white/10 border border-accent-gold/50 rounded-lg px-2 py-1 text-white text-lg font-bold outline-none" />
                                                    <button onClick={() => updateName(entry.id)} className="text-green-400 p-1"><Check size={20} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-red-400 p-1"><X size={20} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-white italic">{entry.name}</h3>
                                                    <button onClick={() => { setEditingId(entry.id); setSaveName(entry.name); }} className="text-white/20 hover:text-accent-gold transition-colors p-1"><Edit2 size={14} /></button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-white/40 text-[12px]"><Clock size={14} /> {new Date(entry.date).toLocaleString('fr-FR')}</div>
                                        </div>
                                        <button onClick={() => deleteEntry(entry.id)} className="p-2 text-white/20 hover:text-red-400"><Trash2 size={18} /></button>
                                    </div>
                                    <div className="space-y-2 bg-black/20 rounded-2xl p-4">
                                        {entry.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-white/80"><span className="text-accent-gold font-bold">{item.qty}x</span> {item.title}</span>
                                                <span className="text-white/40">{item.price * item.qty} F</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 flex justify-between items-center">
                                        <div><p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Total</p><p className="text-xl font-bold text-accent-gold">{entry.total_price} F</p></div>
                                        <button onClick={() => shareAgain(entry)} className="bg-[#25D366] text-white px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"><MessageSquare size={14} fill="currentColor" /> Renvoyer</button>
                                    </div>
                                </div>
                            )) : <div className="text-center py-20 opacity-30 italic">Aucune sauvegarde Cloud.</div>}
                        </motion.div>
                    ) : (
                        <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {favorites.length > 0 ? favorites.map((fav) => (
                                <div key={fav.id} className="bg-surface border border-white/5 rounded-3xl p-4 flex gap-4 items-center">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                                        <Image src={fav.image} alt={fav.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display font-bold text-white">{fav.title}</h4>
                                        <p className="text-accent-gold font-bold text-sm">{fav.price} F</p>
                                    </div>
                                    <button onClick={() => removeFavorite(fav.id)} className="p-2 text-red-400/40 hover:text-red-400"><Trash2 size={18} /></button>
                                </div>
                            )) : <div className="col-span-full text-center py-20 opacity-30 italic">Aucun plat favori.</div>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
