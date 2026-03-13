"use client";
import React, { useEffect, useState, use } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { 
  Copy, Check, ExternalLink, Image as ImageIcon, 
  MessageSquare, CreditCard, ChevronRight, Loader2, Upload, Palette
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProjectDetail({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    const res = await fetch(`/api/projects/${id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const copyLink = () => {
    const link = `${window.location.origin}/p/${data.project.projectToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStatus = async (newStatus) => {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  const handleSketchUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
          await fetch(`/api/projects/${id}/sketch`, {
              method: 'POST',
              body: formData,
          });
          fetchData();
      } catch (err) {
          console.error(err);
      } finally {
          setUploading(false);
      }
  };

  const handlePaymentStatus = async (paymentId, status) => {
    await fetch('/api/payment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId, status }),
    });
    fetchData();
  };

  if (loading) return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    </div>
  );

  const { project, sketches, revisions, payments } = data;

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 md:p-10 pt-20 lg:pt-10">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-6">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{project.mandalName}</h2>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground text-sm">
                {project.year} • {project.theme} 
                <span className="mx-2 text-muted">|</span>
                <span className="text-accent font-bold">₹{project.totalAmount} Total</span>
                <span className="mx-2 text-muted">|</span>
                <span className="text-white/60">₹{project.advanceAmount} Adv.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="bg-card border border-muted rounded-xl p-1 flex items-center overflow-hidden flex-1 sm:flex-initial">
                <div className="px-3 py-1 text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    .../p/{project.projectToken}
                </div>
                <button 
                    onClick={copyLink}
                    className="p-2 hover:bg-muted text-accent rounded-lg transition-colors flex-shrink-0"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>
            <Link 
              href={`/p/${project.projectToken}`} 
              target="_blank"
              className="px-4 py-2 bg-muted hover:bg-accent hover:text-accent-foreground text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
            >
              View Client Page
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Management */}
          <div className="col-span-1 lg:col-span-8 space-y-8">
            {/* Concepts Section */}
            <section className="bg-card border border-muted rounded-2xl p-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Palette className="text-accent" size={20} />
                    Project Concepts
                </h3>
                <div className="space-y-4">
                    {project.concepts && project.concepts.map(c => (
                        <div key={c._id} className={cn(
                            "p-4 rounded-xl border transition-all",
                            c.selected ? "bg-accent/5 border-accent/30 shadow-inner shadow-accent/5" : "bg-background border-muted"
                        )}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-sm text-white">{c.title}</h4>
                                {c.selected && <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-black uppercase">Selected</span>}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                        </div>
                    ))}
                    {(!project.concepts || project.concepts.length === 0) && (
                         <p className="text-sm text-muted-foreground italic">No concepts added to this project.</p>
                    )}
                </div>
            </section>

            {/* Sketch Section */}
            <section className="bg-card border border-muted rounded-2xl p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                        <ImageIcon className="text-accent" size={20} />
                        Sketches
                    </h3>
                    <label className="bg-accent text-accent-foreground px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 shadow-lg active:scale-95">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <span>Upload</span>
                        <input type="file" className="hidden" onChange={handleSketchUpload} />
                    </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sketches.map(s => (
                        <div key={s._id} className="relative aspect-[3/4] bg-background rounded-lg overflow-hidden border border-muted group">
                            <img src={s.previewImageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a href={s.hdImageUrl} target="_blank" className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform">
                                    <ImageIcon size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                    {sketches.length === 0 && (
                        <div className="col-span-3 py-12 text-center text-muted-foreground text-sm italic border-2 border-dashed border-muted rounded-xl">
                            No sketches uploaded yet.
                        </div>
                    )}
                </div>
            </section>

            {/* Revisions */}
            <section className="bg-card border border-muted rounded-2xl p-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <MessageSquare className="text-accent" size={20} />
                    Revision Requests
                </h3>
                <div className="space-y-4">
                    {revisions.map(r => (
                        <div key={r._id} className="p-4 bg-background border border-muted rounded-xl">
                            <p className="text-sm mb-2">{r.message}</p>
                            <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                    ))}
                    {revisions.length === 0 && (
                        <p className="text-center text-muted-foreground py-8 text-sm italic">No requests from client.</p>
                    )}
                </div>
            </section>
          </div>

          {/* Right Column: Status & Payments */}
          <div className="col-span-1 lg:col-span-4 space-y-8">
             <section className="bg-card border border-muted rounded-2xl p-6">
                <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-6">Update Status</h3>
                <div className="space-y-2">
                    {['concept', 'awaiting_advance', 'sketch_preview', 'awaiting_final_payment', 'completed'].map(s => (
                        <button 
                            key={s}
                            onClick={() => updateStatus(s)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all ${
                                project.status === s ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-muted/50 border border-transparent'
                            }`}
                        >
                            <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                            {project.status === s ? <Check size={16} /> : <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100" />}
                        </button>
                    ))}
                </div>
             </section>

             <section className="bg-card border border-muted rounded-2xl p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <CreditCard className="text-accent" size={20} />
                    Payments
                </h3>
                <div className="space-y-4">
                    {payments.map(p => (
                        <div key={p._id} className="p-4 border border-muted rounded-xl bg-background space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-accent tracking-wider">{p.type}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                    p.status === 'approved' ? 'border-green-600/50 text-green-500' : 
                                    p.status === 'rejected' ? 'border-red-600/50 text-red-500' : 'border-yellow-600/50 text-yellow-500'
                                }`}>
                                    {p.status}
                                </span>
                            </div>
                            <img src={p.screenshotUrl} className="w-full rounded-lg h-32 object-cover cursor-zoom-in" />
                            {p.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handlePaymentStatus(p._id, 'approved')}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handlePaymentStatus(p._id, 'rejected')}
                                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {payments.length === 0 && (
                        <p className="text-muted-foreground text-center py-6 text-sm italic">No payments yet.</p>
                    )}
                </div>
             </section>
          </div>
        </div>
      </main>
    </div>
  );
}
