"use client";
import React, { useState } from 'react';
import { Download, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const SketchPreview = ({ sketch, isCompleted }) => {
  return (
    <div className="bg-card border border-muted p-4 rounded-2xl space-y-4 shadow-sm group">
      <div className="relative overflow-hidden rounded-xl border border-muted/50 bg-background">
        <img 
          src={sketch.previewImageUrl || sketch.hdImageUrl} 
          className="w-full aspect-[3/4] object-cover transition-all duration-700"
          alt="Sketch Preview"
        />
        
        {!isCompleted && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl">
              <span className="text-[9px] text-white/90 font-bold uppercase tracking-widest flex items-center gap-2">
                <Lock size={10} className="text-accent" />
                Protected Preview
              </span>
            </div>
          </div>
        )}
        
        {/* Watermark badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-xl">
          <ShieldCheck size={12} className="text-accent" />
          <span className="text-[8px] text-white font-black uppercase tracking-tighter">Studio Protected</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {isCompleted ? (
          <a 
            href={sketch.hdImageUrl} 
            download
            className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-accent/20 active:scale-95"
          >
            <Download size={18} />
            Download HD Sketch
          </a>
        ) : (
          <button 
            disabled 
            className="w-full flex items-center justify-center gap-2 bg-muted/50 text-muted-foreground py-3 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed border border-muted"
          >
            <Download size={18} />
            HD Available Later
          </button>
        )}
      </div>
    </div>
  );
};

export default SketchPreview;
