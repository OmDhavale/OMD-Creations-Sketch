"use client";
import React, { useState, useEffect } from 'react';
import { ImagePlay, ShieldCheck } from 'lucide-react';

export default function PublicGallery() {
    const [sketches, setSketches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/gallery');
                if (res.ok) {
                    const data = await res.json();
                    setSketches(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground tracking-tight">
            {/* Minimalist Hero */}
            <header className="relative pt-10 pb-10 px-6 overflow-hidden border-b border-muted">
                <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
                    {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <ShieldCheck size={12} />
                        Verified Studio Portfolio
                    </div> */}

                    <h1 className="text-4xl md:text-4xl font-black text-white tracking-tighter">
                        OMD <span className="text-accent">Creations</span>
                    </h1>
                    <p className="text-sm md:text-xs text-muted-foreground uppercase tracking-[0.15em] font-medium max-w-2xl mx-auto leading-relaxed">
                        {/* A showcase of our premium Sketch artistry and previous Mandal projects. */}
                        Setting New Trends with Authentic, Unseen, Culturally rooted Concepts.
                    </p>
                </div>
            </header>

            {/* Gallery Grid */}
            <main className="max-w-7xl mx-auto p-6 lg:p-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold animate-pulse">Loading Masterpieces...</p>
                    </div>
                ) : sketches.length === 0 ? (
                    <div className="text-center py-32 space-y-4">
                        <ImagePlay className="mx-auto text-muted-foreground opacity-20" size={64} />
                        <h3 className="text-2xl font-black text-white">Gallery is Empty</h3>
                        <p className="text-muted-foreground uppercase tracking-widest text-sm">The artist hasn't published any sketches yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sketches.map((img) => (
                            <div key={img._id} className="group relative rounded-2xl overflow-hidden bg-card border border-muted shadow-xl hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 transition-all duration-500">

                                {/* Watermarked Image */}
                                <div className="aspect-[3/4] bg-[#0f0f0f] relative overflow-hidden">
                                    <img
                                        src={img.imageUrl}
                                        alt={img.title || "OMD Creations Sketch"}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-90 grayscale-[20%] group-hover:grayscale-0"
                                        loading="lazy"
                                    />

                                    {/* Gradient overlay to make text readable */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent pointer-events-none" />
                                </div>

                                {/* Project Info Overlay (Title if available) */}
                                {img.title && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="font-black text-white text-xl leading-tight truncate drop-shadow-md">
                                            {img.title}
                                        </h3>
                                    </div>
                                )}

                                {/* Frame aesthetic border */}
                                <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none mix-blend-overlay group-hover:border-accent/20 transition-colors duration-500" />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="border-t border-muted py-8 text-center text-muted-foreground text-[10px] uppercase tracking-widest font-black bg-card/50 backdrop-blur-md">
                © {new Date().getFullYear()} OMD Creations • All Rights Reserved
            </footer>
        </div>
    );
}
