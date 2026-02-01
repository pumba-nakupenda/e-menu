"use client";

import { Search, User } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AccountMenu from "./AccountMenu";

interface NavbarProps {
    onSearchClick: () => void;
    lang: "FR" | "EN";
    onLangChange: (lang: "FR" | "EN") => void;
}

export default function Navbar({ onSearchClick, lang, onLangChange }: NavbarProps) {
    const { data: session } = useSession();
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                    <div className="text-accent-gold">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 9H9V2H7V9H5V2H3V9C3 11.12 4.66 12.84 6.75 12.97V22H9.25V12.97C11.34 12.84 13 11.12 13 9V2H11V9ZM16 6V14h3v8h2V2c-2.76 0-5 2.24-5 4z" />
                        </svg>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight italic">E-MENU</span>      
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSearchClick}
                        className="p-1 hover:text-accent-gold transition-colors text-white"
                    >
                        <Search size={22} strokeWidth={1.5} />
                    </button>

                    {/* Language Toggle restored */}
                    <button
                        onClick={() => onLangChange(lang === "FR" ? "EN" : "FR")}
                        className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5 transition-all active:scale-95"
                    >
                        <span className={lang === "FR" ? "text-accent-gold" : "text-text-secondary"}>FR</span>
                        <span className="w-px h-2.5 bg-white/10" />
                        <span className={lang === "EN" ? "text-accent-gold" : "text-text-secondary"}>EN</span>
                    </button>

                    {/* Auth Section */}
                    <div className="flex items-center ml-1 border-l border-white/10 pl-4">
                        {session ? (
                            <button 
                                onClick={() => setIsAccountMenuOpen(true)}
                                className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-accent-gold/30 hover:border-accent-gold transition-all p-0.5"
                            >
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-accent-gold/20 flex items-center justify-center">
                                            <User size={16} className="text-accent-gold" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => signIn()}
                                className="text-white/70 hover:text-accent-gold transition-colors p-1"
                            >
                                <User size={22} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <AccountMenu 
                isOpen={isAccountMenuOpen} 
                onClose={() => setIsAccountMenuOpen(false)} 
                lang={lang} 
                onLangChange={onLangChange} 
            />
        </>
    );
}
