"use client";
import React, { useState } from 'react';
import { Download, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const SketchPreview = ({ sketch, isCompleted }) => {
  return (
    <div className="bg-card border border-muted p-4 rounded-2xl space-y-4 shadow-sm group">
      <div className="relative overflow-hidden rounded-xl border border-muted/50 bg-background">
        <img 
          src={sketch.previewImageUrl} 
          className={cn(
            "w-full aspect-[3/4] object-cover transition-all duration-700",
            !isCompleted && "blur-[1.5px] group-hover:blur-0 scale-105 group-hover:scale-100"
          )} 
          alt="Sketch Preview"
        />
        
        {/* Protection Overlay */}
        {!isCompleted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
            <Lock size={32} className="text-accent mb-2 animate-bounce" />
            <p className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Preview Locked</p>
            <p className="text-[8px] text-white/70 italic mt-1 font-medium">Released after final payment</p>
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
