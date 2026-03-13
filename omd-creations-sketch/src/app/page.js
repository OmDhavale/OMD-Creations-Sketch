import Link from "next/link";
import { Sparkles, ArrowRight, Palette, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-bold mb-6">
            <Sparkles size={16} />
            <span>Premium Mural Sketch Portal</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-black mb-6 tracking-tighter text-white">
            OMD <span className="text-accent">CREATIONS</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Professional Ganesh Murti sketch management for Mandals and Artists.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Admin Entry */}
          <Link href="/admin/dashboard" className="group p-8 bg-card border border-muted rounded-3xl hover:border-accent transition-all hover:scale-[1.02]">
            <div className="p-4 bg-accent/20 rounded-2xl w-fit mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors text-accent">
              <Palette size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Artist Dashboard</h3>
            <p className="text-muted-foreground mb-8 text-sm">
              Manage projects, upload sketches, approve payments and track revisions.
            </p>
            <div className="flex items-center gap-2 font-bold text-accent">
              Enter Studio <ArrowRight size={18} />
            </div>
          </Link>

          {/* Client Portal Note */}
          <div className="p-8 bg-zinc-900/50 border border-muted rounded-3xl opacity-80">
            <div className="p-4 bg-muted rounded-2xl w-fit mb-6 text-muted-foreground">
              <Shield size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white/50">Client Portal</h3>
            <p className="text-muted-foreground mb-8 text-sm italic">
              Access is private via project-specific tokens. Please use the link provided by the artist.
            </p>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold border-t border-muted pt-4">
              Requires Private Link
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center text-muted-foreground text-xs uppercase tracking-[0.2em]">
          &copy; 2026 OMD Creations Art Studio
        </footer>
      </div>
    </div>
  );
}

