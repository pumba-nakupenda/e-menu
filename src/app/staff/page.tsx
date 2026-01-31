"use client";

import { useEffect, useState, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { BellRing, CheckCircle2, Clock, MapPin, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";

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

  const playNotificationSound = (count: number) => {
    if (!isAudioEnabled) return;
    // Un seul son élégant pour tous les appels
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play().catch(e => console.log("Audio play blocked"));
  };

  useEffect(() => {
    const fetchCalls = async () => {
      const data = await staffClient.fetch(`*[_type == "notification" && status != "done"] | order(_createdAt desc)`);
      setCalls(data);
    };
    fetchCalls();

    const subscription = staffClient.listen(`*[_type == "notification"]`, {}, { includeResult: true }).subscribe((update) => {
      const transition = update.transition;
      const result = update.result as any;

      if (transition === 'appear') {
        const newCall = result as unknown as ServerCall;
        setCalls(prev => [newCall, ...prev]);
        playNotificationSound(calls.filter(c => c.tableNumber === newCall.tableNumber).length + 1);
      } 
      else if (transition === 'update') {
        if (result.status === 'done') {
          // Si le statut passe à "done", on le retire de la liste
          setCalls(prev => prev.filter(c => c._id !== update.documentId));
        } else {
          // Sinon on met à jour l'appel dans la liste
          setCalls(prev => prev.map(c => c._id === update.documentId ? result : c));
        }
      }
      else if (transition === 'disappear') {
        setCalls(prev => prev.filter(c => c._id !== update.documentId));
      }
    });

    return () => subscription.unsubscribe();
  }, [calls, isAudioEnabled]);

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

  const handleResolveTable = async (tableNumber: string) => {
    try {
      // Résoudre TOUS les appels en attente pour cette table d'un coup
      const tableCalls = calls.filter(c => c.tableNumber === tableNumber);
      await Promise.all(tableCalls.map(call => 
        fetch('/api/resolve-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: call._id, status: 'done' }),
        })
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* OVERLAY POUR DÉBLOQUER L'AUDIO */}
      {!isAudioEnabled && (
          <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
              <div className="max-w-sm space-y-8">
                  <div className="w-24 h-24 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto border border-accent-gold/20">
                      <BellRing size={40} className="text-accent-gold animate-bounce" />
                  </div>
                  <div className="space-y-2">
                      <h2 className="text-2xl font-display font-bold italic text-white">Activer le centre</h2>
                      <p className="text-text-secondary text-sm leading-relaxed">Pour recevoir les alertes sonores en direct, veuillez activer la session.</p>
                  </div>
                  <button 
                    onClick={() => setIsAudioEnabled(true)}
                    className="w-full bg-accent-gold text-background font-bold py-5 rounded-2xl shadow-gold hover:scale-[1.02] transition-all"
                  >
                      DÉMARRER LE SERVICE
                  </button>
              </div>
          </div>
      )}

      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold italic text-accent-gold">Centre de Service</h1>
          <p className="text-text-secondary text-sm tracking-widest uppercase">E-MENU Management</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">En attente :</span>
                <span className="text-accent-gold font-bold">{calls.length}</span>
            </div>
            <div className="bg-accent-gold/10 px-4 py-2 rounded-full border border-accent-gold/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-accent-gold text-xs font-bold uppercase tracking-tighter">Live Connection</span>
            </div>
        </div>
      </header>

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
                className="bg-surface border border-white/5 p-6 rounded-[32px] shadow-2xl relative overflow-hidden group"
              >
                {/* Status Bar */}
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

                <div className="mb-8">
                  <p className="text-lg font-medium text-white/90">
                    {latest.type === 'bill' ? "Demande l'addition" : "Appel serveur"}
                  </p>
                </div>

                <button
                  onClick={() => handleResolveTable(latest.tableNumber)}
                  className="w-full bg-white/5 hover:bg-accent-gold hover:text-background text-white/60 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-accent-gold"
                >
                  <CheckCircle2 size={20} />
                  MARQUER COMME TERMINÉ
                </button>
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

      <footer className="mt-20 border-t border-white/10 pt-8 text-center text-text-secondary">
        <p className="text-[10px] tracking-[0.2em] uppercase">
          © 2026 E-MENU Management • Développé par LOLLY SAS
        </p>
      </footer>
    </div>
  );
}
