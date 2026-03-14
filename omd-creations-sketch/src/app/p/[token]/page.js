"use client";
import React, { useEffect, useState, use } from 'react';
import StatusBadge from '@/components/StatusBadge';
import SketchPreview from '@/components/SketchPreview';
import PaymentUpload from '@/components/PaymentUpload';
import RevisionForm from '@/components/RevisionForm';
import { Loader2, Palette, Info, CreditCard, Download, ExternalLink, Copy, Zap, Upload, Clock, Info as ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientPortal({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/client/${token}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSelectConcept = async (conceptId) => {
    try {
      const res = await fetch(`/api/client/${token}/select-concept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="animate-spin text-accent" size={48} />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6 text-white font-medium">
      <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
      <p className="text-muted-foreground">This link may be invalid or expired.</p>
    </div>
  );

  const { project, sketches, payments, revisions, artist } = data;
  const isCompleted = project.status === 'completed';

  return (
    <div className="bg-background min-h-screen pb-20 font-sans">
      {/* Header */}
      <header className="bg-card border-b border-muted p-5 sticky top-0 z-30 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">{project.mandalName}</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{project.year} • {project.theme}</p>
        </div>
        <StatusBadge status={project.status} />
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-8 mt-6">
        {/* Rejection Alert */}
        {payments.some(p => p.status === 'rejected') && (
            <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start animate-bounce-short">
                <ShieldAlert className="text-red-500 flex-shrink-0" size={18} />
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Payment Rejected</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your submitted payment was rejected by the artist. Please check the history below and re-submit or contact the artist.
                    </p>
                </div>
            </section>
        )}

        {/* Psychological Trigger / Legal Notice */}
        <section className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex gap-3 items-start backdrop-blur-sm">
            <Info className="text-accent flex-shrink-0" size={18} />
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Intellectual Property Notice</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    This design preview is licensed only for review by {project.mandalName}. Unauthorized use without payment violates artist rights. Hidden watermarks present.
                </p>
            </div>
        </section>

        {/* CONCEPT STAGE */}
        {project.status === 'concept' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex p-4 bg-accent/20 rounded-full text-accent shadow-lg shadow-accent/20">
                        <Palette size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Concept Selection</h2>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Please select the vision that matches your Mandal's requirement.</p>
                </div>

                <div className="space-y-4">
                    {project.concepts && project.concepts.map((concept) => (
                        <div 
                            key={concept._id} 
                            className={`p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                                concept.selected 
                                    ? "bg-accent/10 border-accent shadow-lg shadow-accent/10" 
                                    : "bg-card border-muted hover:border-accent/40"
                            }`}
                            onClick={() => !concept.selected && handleSelectConcept(concept._id)}
                        >
                            {concept.selected && (
                                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-[10px] font-bold rounded-bl-xl uppercase tracking-widest">
                                    Selected
                                </div>
                            )}
                            <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{concept.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{concept.description}</p>
                        </div>
                    ))}

                    {(!project.concepts || project.concepts.length === 0) && (
                        <div className="text-center py-10 bg-card border border-muted border-dashed rounded-2xl">
                             <p className="text-sm text-muted-foreground italic">Generating concepts... Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>
        )}

        {/* PAYMENT STAGE (Advance) */}
        {project.status === 'awaiting_advance' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-card border border-muted rounded-3xl p-6 text-center space-y-6 border-t-4 border-t-accent shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 bg-accent/10 w-32 h-32 rounded-full blur-3xl opacity-50" />
                    
                    <div className="inline-flex p-5 bg-accent/20 rounded-full text-accent shadow-inner">
                        <CreditCard size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Advance Required</h2>
                        <p className="text-sm text-muted-foreground">To proceed with drawing, please settle the advance.</p>
                    </div>

                    <div className="py-5 px-6 bg-background rounded-2xl border border-muted flex flex-col items-center gap-2 shadow-inner">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Amount Due</span>
                        <span className="text-4xl font-black text-white">₹{project.advanceAmount}</span>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="p-4 bg-muted/20 rounded-2xl border border-muted flex justify-between items-center group active:scale-95 transition-transform">
                            <div className="text-left">
                                <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Studio UPI ID</p>
                                <p className="text-lg font-mono text-white select-all">{artist.upiId}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(artist.upiId);
                                    alert('UPI ID Copied!');
                                }}
                                className="p-4 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-2xl transition-all shadow-lg active:scale-90"
                            >
                                <Copy size={24} />
                            </button>
                        </div>
                        
                        {!hasPaid ? (
                            <button 
                                onClick={() => setHasPaid(true)}
                                className="w-full py-4 bg-accent text-accent-foreground font-black rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                [ I HAVE PAID ]
                            </button>
                        ) : (
                            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-300">
                                <h3 className="font-bold text-sm uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                                    <Upload size={16} />
                                    Upload Payment Screenshot
                                </h3>
                                <PaymentUpload 
                                    projectId={project._id} 
                                    type="advance" 
                                    onUploadSuccess={fetchData} 
                                />
                                <button 
                                    onClick={() => setHasPaid(false)}
                                    className="mt-4 text-[10px] text-muted-foreground hover:text-white transition-colors"
                                >
                                    ← Back to payment instructions
                                </button>
                            </div>
                        )}

                        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-2 font-medium pt-2">
                            <Zap size={10} className="text-accent" /> Copied UPI? Paste in GPay, PhonePe or Paytm.
                        </p>
                    </div>
                </div>
            </section>
        )}

        {/* PAYMENT STAGE (Final) */}
        {project.status === 'awaiting_final_payment' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-card border border-muted rounded-3xl p-6 text-center space-y-6 border-t-4 border-t-accent shadow-xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 bg-accent/10 w-32 h-32 rounded-full blur-3xl opacity-50" />
                    
                    <div className="inline-flex p-5 bg-accent/20 rounded-full text-accent shadow-inner">
                        <CreditCard size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Final Payment Required</h2>
                        <p className="text-sm text-muted-foreground">Drawing complete! Settle the remaining balance to unlock HD files.</p>
                    </div>

                    <div className="py-5 px-6 bg-background rounded-2xl border border-muted flex flex-col items-center gap-2 shadow-inner">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Balance Due</span>
                        <span className="text-4xl font-black text-white">
                            ₹{project.advanceWaived ? project.totalAmount : (project.totalAmount - project.advanceAmount)}
                        </span>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="p-4 bg-muted/20 rounded-2xl border border-muted flex justify-between items-center group active:scale-95 transition-transform">
                            <div className="text-left">
                                <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Studio UPI ID</p>
                                <p className="text-lg font-mono text-white select-all">{artist.upiId}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(artist.upiId);
                                    alert('UPI ID Copied!');
                                }}
                                className="p-4 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-2xl transition-all shadow-lg active:scale-90"
                            >
                                <Copy size={24} />
                            </button>
                        </div>
                        
                        {!hasPaid ? (
                            <button 
                                onClick={() => setHasPaid(true)}
                                className="w-full py-4 bg-accent text-accent-foreground font-black rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                [ I HAVE PAID ]
                            </button>
                        ) : (
                            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-300">
                                <h3 className="font-bold text-sm uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                                    <Upload size={16} />
                                    Upload Final Payment Screenshot
                                </h3>
                                <PaymentUpload 
                                    projectId={project._id} 
                                    type="final" 
                                    onUploadSuccess={fetchData} 
                                />
                                <button 
                                    onClick={() => setHasPaid(false)}
                                    className="mt-4 text-[10px] text-muted-foreground hover:text-white transition-colors"
                                >
                                    ← Back to payment instructions
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        )}

        {/* Balance Due calculation adjustment */}
        {project.status === 'awaiting_final_payment' && (
            <div className="hidden">
                {/* Visual balance calculation is already in the final payment section below */}
            </div>
        )}

        {/* Sketches */}
        <section className="space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-xs ml-2 text-muted-foreground flex items-center gap-2">
                <Palette size={14} className="text-accent" />
                Draft & Sketches
            </h3>
            
            {(project.status === 'awaiting_advance' && !project.advanceWaived) ? (
                <div className="bg-card border border-muted border-dashed rounded-3xl p-12 text-center space-y-4 shadow-xl">
                    <div className="inline-flex p-4 bg-muted/20 rounded-full text-muted-foreground">
                        <Palette size={32} className="opacity-20" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-white">Sketches Locked</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed px-6">
                            Drafts and sketches will be unlocked once the advance payment is confirmed.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sketches.map(s => (
                        <SketchPreview key={s._id} sketch={s} isCompleted={isCompleted} />
                    ))}
                    {sketches.length === 0 && (
                        <div className="col-span-2 py-12 text-center bg-card border border-muted rounded-2xl border-dashed">
                            <p className="text-sm text-muted-foreground italic">Sketches will appear here shortly.</p>
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* Revision Requests (Only if in preview mode) */}
        {project.status === 'sketch_preview' && (
            <RevisionForm 
                projectId={project._id} 
                revisionsUsed={project.revisionsUsed} 
                revisionLimit={project.revisionLimit} 
                onSubmitted={fetchData} 
                artist={artist}
                revisions={revisions}
            />
        )}

        {/* Payment History */}
        {payments.length > 0 && (
            <section className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest text-xs ml-2 text-muted-foreground flex items-center gap-2">
                    <Clock size={14} className="text-accent" />
                    Payment History
                </h3>
                <div className="bg-card border border-muted rounded-2xl overflow-hidden divide-y divide-muted/50">
                    {payments.map(p => (
                        <div key={p._id} className="flex justify-between items-center bg-card p-4 hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    p.status === 'approved' ? "bg-green-500/10 text-green-500" :
                                    p.status === 'rejected' ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                                )}>
                                    <CreditCard size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-wider">{p.type} Payment</span>
                                    <span className="text-[8px] text-muted-foreground uppercase font-medium">{p.paymentMode || 'upi'} mode</span>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter",
                                p.status === 'approved' ? 'border-green-600/50 text-green-500' : 
                                p.status === 'rejected' ? 'border-red-600/50 text-red-500 font-bold bg-red-500/5' : 'border-yellow-600/50 text-yellow-500'
                            )}>
                                {p.status === 'rejected' ? 'REJECTED' : p.status}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Support Link */}
        <footer className="text-center pt-12 border-t border-muted pb-8 space-y-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                Professional Artist Gateway
            </p>
            <p className="text-xs text-muted-foreground italic">
                Questions? Contact {artist.name} directly.
            </p>
            <div className="flex justify-center gap-4">
                 <div className="w-10 h-0.5 bg-accent/20 rounded-full" />
                 <div className="w-1 h-0.5 bg-accent rounded-full" />
                 <div className="w-10 h-0.5 bg-accent/20 rounded-full" />
            </div>
        </footer>
      </main>
    </div>
  );
}
