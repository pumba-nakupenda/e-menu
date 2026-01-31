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
    <div className="min-h-screen bg-black text-white p-8">
      {!isAudioEnabled && (
          <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
              <div className="max-w-sm space-y-8">
                  <div className="w-24 h-24 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto border border-accent-gold/20">
                      <BellRing size={40} className="text-accent-gold animate-bounce" />
                  </div>
                  <div className="space-y-2">
                      <h2 className="text-2xl font-display font-bold italic text-white">Activer le centre</h2>
                      <p className="text-text-secondary text-sm leading-relaxed">Pusher Channels Activé : 0 Latence</p>
                  </div>
                  <button 
                    onClick={() => {
                        setIsAudioEnabled(true);
                        notificationSound?.load();
                    }}
                    className="w-full bg-accent-gold text-background font-bold py-5 rounded-2xl shadow-gold hover:scale-[1.02] transition-all"
                  >
                      DÉMARRER LE SERVICE (FAST)
                  </button>
              </div>
          </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold italic text-accent-gold">Centre de Service</h1>
          <p className="text-text-secondary text-sm tracking-widest uppercase">E-MENU MANAGEMENT</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
            {/* Toggle Vue */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", viewMode === 'grid' ? "bg-accent-gold text-background" : "text-white/40")}
                >
                    Plan de salle
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", viewMode === 'list' ? "bg-accent-gold text-background" : "text-white/40")}
                >
                    Flux d'appels
                </button>
            </div>

            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Actifs :</span>
                <span className="text-accent-gold font-bold">{calls.length}</span>
            </div>
            
            {/* Statut Pusher */}
            <div className={cn(
                "px-4 py-2 rounded-full border flex items-center gap-2 transition-colors",
                pusherStatus === 'connected' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                pusherStatus === 'connecting' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    pusherStatus === 'connected' ? "bg-green-500" : "bg-current animate-pulse"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {pusherStatus === 'connected' ? "Pusher Live" : 
                     pusherStatus === 'connecting' ? "Pusher Connect..." : "Pusher Offline"}
                </span>
            </div>
        </div>
      </header>

      {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {totalTables.map(num => {
                  const tableCalls = calls.filter(c => c.tableNumber === num);
                  const isPending = tableCalls.some(c => c.status === 'pending');
                  const isProcessing = tableCalls.some(c => c.status === 'processing');
                  const hasBill = tableCalls.some(c => c.type === 'bill');

                  return (
                      <motion.div
                        key={num}
                        layout
                        onClick={() => tableCalls.length > 0 && handleResolveTable(num)}
                        className={cn(
                            "aspect-square rounded-[32px] border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden",
                            tableCalls.length > 0 
                                ? (isProcessing ? "bg-blue-500/20 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-accent-gold/20 border-accent-gold/40 animate-pulse shadow-gold")
                                : "bg-white/5 border-white/5 opacity-40 hover:opacity-60"
                        )}
                      >
                          <span className="text-3xl font-display font-bold italic">{num}</span>
                          <div className="flex gap-1">
                              {isPending && <div className="w-2 h-2 bg-accent-gold rounded-full" />}
                              {isProcessing && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              {hasBill && <CreditCard size={14} className="text-blue-400" />}
                          </div>
                          
                          {tableCalls.length > 0 && (
                              <div className="absolute top-2 right-2">
                                  <BellRing size={14} className={isProcessing ? "text-blue-400" : "text-accent-gold"} />
                              </div>
                          )}
                      </motion.div>
                  );
              })}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {groupedCalls.length > 0 ? (
                groupedCalls.map(({ latest, count }) => (
                  <motion.div
                    key={latest.tableNumber}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={cn(
                        "bg-surface border p-6 rounded-[32px] shadow-2xl relative overflow-hidden group",
                        latest.status === 'processing' ? "border-blue-500/30" : "border-white/5"
                    )}
                  >
                    <div className={cn(
                        "absolute top-0 left-0 w-1.5 h-full",
                        latest.type === 'bill' ? "bg-blue-500" : "bg-accent-gold"
                    )} />

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent-gold/10 rounded-2xl flex items-center justify-center relative">
                          <MapPin className="text-accent-gold" size={24} />
                          {count > 1 && (
                              <div className="absolute -top-2 -right-2 bg-accent-gold text-background text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface">
                                  {count}
                              </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Table {latest.tableNumber}</h3>
                          <p className="text-[10px] text-text-secondary uppercase tracking-widest">
                            {new Date(latest._createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {latest.type === 'bill' ? (
                        <CreditCard className="text-blue-400" size={24} />
                      ) : (
                        <BellRing className="text-accent-gold" size={24} />
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-8">
                      <p className="text-lg font-medium text-white/90">
                        {latest.type === 'bill' ? "Demande l'addition" : "Appel serveur"}
                      </p>
                      {latest.status === 'processing' && (
                          <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-500/30">
                              EN COURS
                          </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                        {latest.status === 'pending' && (
                            <button
                                onClick={() => handleUpdateStatus(latest._id, 'processing')}
                                className="flex-1 bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-blue-600"
                            >
                                <Clock size={20} />
                                ARRIVE
                            </button>
                        )}
                        <button
                          onClick={() => handleResolveTable(latest.tableNumber)}
                          className={cn(
                              "flex-1 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border",
                              latest.status === 'processing' 
                                ? "bg-accent-gold text-background border-accent-gold" 
                                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                          )}
                        >
                          <CheckCircle2 size={20} />
                          TERMINÉ
                        </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-40 text-center opacity-20">
                  <Clock size={64} className="mx-auto mb-4" />
                  <p className="text-xl italic">Aucun appel en attente pour le moment...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
      )}

      <footer className="mt-20 border-t border-white/10 pt-8 text-center text-text-secondary">
        <p className="text-[10px] tracking-[0.2em] uppercase">
          © 2026 E-MENU Management • Développé par LOLLY SAS
        </p>
      </footer>
    </div>
  );
}