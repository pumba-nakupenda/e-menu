"use client";

import { useEffect, useState, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { BellRing, CheckCircle2, Clock, MapPin, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import Pusher from 'pusher-js';

// Client spécifique pour le staff : PAS DE CDN pour le temps réel
const staffClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, 
});

interface ServerCall {
  _id: string;
  tableNumber: string;
  type: 'waiter' | 'bill';
  status: 'pending' | 'processing' | 'done';
  _createdAt: string;
}

export default function StaffDashboard() {
  const [calls, setCalls] = useState<ServerCall[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [pusherStatus, setPusherStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');

  // Simulation d'un plan de 12 tables
  const totalTables = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Précharger l'audio pour éviter la latence
  const notificationSound = useMemo(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/notification.mp3");
      audio.preload = "auto";
      return audio;
    }
    return null;
  }, []);

  const playNotificationSound = () => {
    if (!isAudioEnabled || !notificationSound) return;
    
    // Reset and play immediately
    notificationSound.currentTime = 0;
    notificationSound.play().catch(e => console.log("Audio play blocked", e));
  };

  useEffect(() => {
    const fetchCalls = async () => {
      const data = await staffClient.fetch(`*[_type == "notification" && status != "done"] | order(_createdAt desc)`);
      setCalls(data);
    };
    fetchCalls();

    // Sécurité : Rafraîchir toutes le minutes au cas où Pusher rate un événement
    const interval = setInterval(fetchCalls, 60000);

    // 2. CONFIGURER PUSHER
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
        console.error("Clé Pusher manquante !");
        setPusherStatus('error');
        return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
    });

    setPusherStatus('connecting');

    pusher.connection.bind('state_change', (states: any) => {
        if (states.current === 'connected') setPusherStatus('connected');
        if (states.current === 'unavailable') setPusherStatus('error');
    });

    const channel = pusher.subscribe('staff-notifications');
    // ... reste du channel.bind

    
    // Nouvel appel
    channel.bind('new-call', (data: ServerCall) => {
      console.log("STAFF: Nouveau call reçu via Pusher", data);
      setCalls(prev => {
          if (prev.find(c => c._id === data._id)) return prev;
          return [data, ...prev];
      });
      playNotificationSound();
    });

    // Appel mis à jour (resolu ou en cours)
    channel.bind('resolved-call', (data: { id: string, status: string }) => {
      console.log("STAFF: Call résolu/majus via Pusher", data);
      if (data.status === 'done') {
        setCalls(prev => prev.filter(c => c._id !== data.id));
      } else {
        setCalls(prev => prev.map(c => c._id === data.id ? { ...c, status: data.status as any } : c));
      }
    });

    // 3. GARDER SANITY EN FALLBACK (Optionnel mais recommandé pour la robustesse)
    const subscription = staffClient.listen(`*[_type == "notification"]`, {}, { includeResult: true }).subscribe((update: any) => {
      const { transition, result, documentId } = update;
      if (transition === 'appear') {
        setCalls(prev => prev.find(c => c._id === documentId) ? prev : [result as unknown as ServerCall, ...prev]);
      } else if (transition === 'update' && result.status === 'done') {
        setCalls(prev => prev.filter(c => c._id !== documentId));
      }
    });

    return () => {
      clearInterval(interval);
      channel.unbind_all();
      channel.unsubscribe();
      subscription.unsubscribe();
    };
  }, [isAudioEnabled]);

  const handleUpdateStatus = async (callId: string, status: 'processing' | 'done', tableNumber?: string) => {
    try {
      if (status === 'done' && tableNumber) {
          setCalls(prev => prev.filter(c => c.tableNumber !== tableNumber));
      } else {
          setCalls(prev => prev.map(c => c._id === callId ? { ...c, status } : c));
      }
      
      await fetch('/api/resolve-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: callId, status }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTable = async (tableNumber: string) => {
    const tableCalls = calls.filter(c => c.tableNumber === tableNumber);
    setCalls(prev => prev.filter(c => c.tableNumber !== tableNumber));
    await Promise.all(tableCalls.map(call => handleUpdateStatus(call._id, 'done')));
  };

  const groupedCalls = useMemo(() => {
    const groups: Record<string, { latest: ServerCall; count: number }> = {};
    calls.forEach(call => {
      if (!groups[call.tableNumber]) {
        groups[call.tableNumber] = { latest: call, count: 1 };
      } else {
        groups[call.tableNumber].count += 1;
        if (new Date(call._createdAt) > new Date(groups[call.tableNumber].latest._createdAt)) {
          groups[call.tableNumber].latest = call;
        }
      }
    });
    return Object.values(groups).sort((a, b) => 
        new Date(b.latest._createdAt).getTime() - new Date(a.latest._createdAt).getTime()
    );
  }, [calls]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ... (Modal audio code stays same) */}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold italic text-accent-gold">Centre de Service</h1>
          <p className="text-text-secondary text-sm tracking-widest uppercase">E-MENU MANAGEMENT • LIVE CONTROL</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Appels Actifs :</span>
                <span className="text-accent-gold font-bold">{calls.length}</span>
            </div>
            
            <div className={cn(
                "px-4 py-2 rounded-full border flex items-center gap-2 transition-colors",
                pusherStatus === 'connected' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
                <div className={cn("w-2 h-2 rounded-full", pusherStatus === 'connected' ? "bg-green-500" : "bg-current animate-pulse")} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {pusherStatus === 'connected' ? "Pusher Live" : "Pusher Offline"}
                </span>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* SECTION GAUCHE : PLAN DE SALLE (4/12) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-6 bg-accent-gold rounded-full" />
            <h2 className="text-xl font-display font-bold italic">Plan de Salle</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {totalTables.map(num => {
                  const tableCalls = calls.filter(c => c.tableNumber === num);
                  const isPending = tableCalls.some(c => c.status === 'pending');
                  const isProcessing = tableCalls.some(c => c.status === 'processing');
                  const hasBill = tableCalls.some(c => c.type === 'bill');

                  return (
                      <motion.div
                        key={num}
                        layout
                        className={cn(
                            "aspect-square rounded-[24px] border flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden",
                            tableCalls.length > 0 
                                ? (isProcessing ? "bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "bg-accent-gold/20 border-accent-gold/40 animate-pulse shadow-gold")
                                : "bg-white/5 border-white/5 opacity-30"
                        )}
                      >
                          <span className="text-xl font-display font-bold italic">{num}</span>
                          <div className="flex gap-1">
                              {isPending && <div className="w-1.5 h-1.5 bg-accent-gold rounded-full" />}
                              {isProcessing && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                              {hasBill && <CreditCard size={12} className="text-blue-400" />}
                          </div>
                      </motion.div>
                  );
              })}
          </div>
        </div>

        {/* SECTION DROITE : FLUX D'APPELS (8/12) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-xl font-display font-bold italic">Flux d'Appels Direct</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {groupedCalls.length > 0 ? (
                groupedCalls.map(({ latest, count }) => (
                  <motion.div
                    key={latest.tableNumber}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                        "bg-surface border p-5 rounded-[28px] shadow-2xl relative overflow-hidden group",
                        latest.status === 'processing' ? "border-blue-500/30" : "border-white/5"
                    )}
                  >
                    <div className={cn(
                        "absolute top-0 left-0 w-1.5 h-full",
                        latest.type === 'bill' ? "bg-blue-500" : "bg-accent-gold"
                    )} />

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-gold/10 rounded-xl flex items-center justify-center relative">
                          <MapPin className="text-accent-gold" size={20} />
                          {count > 1 && (
                              <div className="absolute -top-2 -right-2 bg-accent-gold text-background text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface">
                                  {count}
                              </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Table {latest.tableNumber}</h3>
                          <p className="text-[9px] text-text-secondary uppercase tracking-widest">
                            {new Date(latest._createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {latest.status === 'processing' ? (
                          <Clock className="text-blue-400 animate-spin-slow" size={20} />
                      ) : (
                          latest.type === 'bill' ? <CreditCard className="text-blue-400" size={20} /> : <BellRing className="text-accent-gold" size={20} />
                      )}
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium text-white/90">
                        {latest.type === 'bill' ? "Demande l'addition" : "Appel serveur"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                        {latest.status === 'pending' && (
                            <button
                                onClick={() => handleUpdateStatus(latest._id, 'processing')}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Clock size={16} />
                                ARRIVE
                            </button>
                        )}
                        <button
                          onClick={() => handleResolveTable(latest.tableNumber)}
                          className={cn(
                              "flex-1 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border",
                              latest.status === 'processing' 
                                ? "bg-accent-gold text-background border-accent-gold" 
                                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                          )}
                        >
                          <CheckCircle2 size={16} />
                          TERMINÉ
                        </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center opacity-10">
                  <Clock size={48} className="mx-auto mb-4" />
                  <p className="text-lg italic">Aucun appel en attente...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="mt-20 border-t border-white/10 pt-8 text-center text-text-secondary">
        <p className="text-[10px] tracking-[0.2em] uppercase">
          © 2026 E-MENU Management • Développé par LOLLY SAS
        </p>
      </footer>
    </div>
  );
}