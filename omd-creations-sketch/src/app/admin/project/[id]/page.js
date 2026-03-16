"use client";
import React, { useEffect, useState, use } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import {
    Copy, Check, ExternalLink, Image as ImageIcon,
    MessageSquare, CreditCard, ChevronRight, Loader2, Upload, Palette, Info, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProjectDetail({ params }) {
    const { id } = use(params);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingSketch, setDeletingSketch] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

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

    const updateStatus = async (newStatus, additionalData = {}) => {
        const res = await fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, ...additionalData }),
        });
        
        if (!res.ok) {
            const err = await res.json();
            alert(err.error || 'Failed to update status');
        }
        
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

    const handleDeleteSketch = async (sketchId) => {
        if (!confirm('Are you sure you want to delete this sketch? This cannot be undone.')) return;

        setDeletingSketch(sketchId);
        try {
            const res = await fetch(`/api/sketch/${sketchId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete sketch');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the sketch');
        } finally {
            setDeletingSketch(null);
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

    const handleRevisionStatus = async (revisionId, status) => {
        await fetch('/api/revision', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: revisionId, status }),
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
            <main className="lg:ml-64 flex-1 p-4 md:p-10 pt-24 lg:pt-10">
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

                            {project.concepts && project.concepts.some(c => c.selected) && (
                                <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-2 shadow-sm">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <Palette className="text-green-500" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Mandal Action: Concept Selected</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">The mandal has confirmed their required vision. Please proceed with the sketch work.</p>
                                    </div>
                                </div>
                            )}

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
                                        <img src={s.hdImageUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                                            <a href={s.hdImageUrl} target="_blank" className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg flex items-center justify-center" aria-label="View HD">
                                                <ExternalLink size={14} />
                                            </a>
                                            <button 
                                                onClick={() => handleDeleteSketch(s._id)}
                                                disabled={deletingSketch === s._id}
                                                className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Delete Sketch"
                                            >
                                                {deletingSketch === s._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            </button>
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
                                {revisions.filter(r => r.paymentStatus !== 'pending_payment').map(r => (
                                    <div key={r._id} className="p-4 bg-background border border-muted rounded-xl space-y-4 shadow-inner">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-sm text-white leading-relaxed">{r.message}</p>
                                                <span className="text-[10px] text-muted-foreground uppercase font-medium">{new Date(r.createdAt).toLocaleString()}</span>
                                            </div>
                                            {r.type !== 'none' && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">
                                                        {r.type}
                                                    </span>
                                                    {r.isPaid && (
                                                        <span className={cn(
                                                            "text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border",
                                                            r.paymentStatus === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                            r.paymentStatus === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                            r.paymentStatus === 'pending_approval' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                            'bg-muted/10 border-muted/20 text-muted-foreground'
                                                        )}>
                                                            {r.paymentStatus === 'pending_approval' ? 'Paid (Pending)' : 
                                                             r.paymentStatus === 'approved' ? 'Paid (Approved)' :
                                                             r.paymentStatus === 'rejected' ? 'Paid (Rejected)' : 'Paid (Pending Payment)'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Details for Paid Revisions */}
                                        {r.paymentStatus === 'pending_approval' && (
                                            <div className="pt-3 border-t border-muted/50 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Payment Proof</span>
                                                    <span className="text-[10px] uppercase text-accent font-black tracking-widest">{r.paymentMode} mode</span>
                                                </div>
                                                
                                                {r.paymentMode === 'upi' && r.screenshotUrl && (
                                                    <div 
                                                        className="relative h-32 rounded-lg overflow-hidden border border-muted cursor-zoom-in group"
                                                        onClick={() => setSelectedImage(r.screenshotUrl)}
                                                    >
                                                        <img src={r.screenshotUrl} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <span className="text-[9px] bg-black/60 text-white px-2 py-1 rounded uppercase font-black">View Proof</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRevisionStatus(r._id, 'approved')}
                                                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-green-600/10"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevisionStatus(r._id, 'rejected')}
                                                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-600/10"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                {['concept', 'awaiting_advance', 'sketch_preview', 'awaiting_final_payment', 'completed'].map(s => {
                                    const hasApprovedFinal = payments.some(p => p.type === 'final' && p.status === 'approved');
                                    const isLocked = project.status === 'completed' && hasApprovedFinal;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => !isLocked && updateStatus(s)}
                                            disabled={isLocked && project.status !== s}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all",
                                                project.status === s ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-muted/50 border border-transparent',
                                                isLocked && project.status !== s && "opacity-40 cursor-not-allowed grayscale"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                                                {isLocked && project.status === s && (
                                                    <span className="text-[10px] text-accent/60 font-medium tracking-wide">Status Locked</span>
                                                )}
                                            </div>
                                            {project.status === s ? <Check size={16} /> : <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="bg-card border border-muted rounded-2xl p-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <CreditCard className="text-accent" size={20} />
                                Payments
                            </h3>
                            <div className="space-y-4">
                                {/* Advance Waive Option */}
                                {project.status === 'awaiting_advance' && !project.advanceWaived && (
                                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-accent">
                                            <Info size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Advance Pending</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                                            You can waive the advance payment if you trust this mandal. Previews will be unlocked, and the amount will be added to the final payment.
                                        </p>
                                        <button 
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to waive the advance payment? Previews will be unlocked immediately.')) {
                                                    await updateStatus('sketch_preview', { advanceWaived: true });
                                                }
                                            }}
                                            className="w-full py-2 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground text-[10px] font-bold uppercase rounded-lg transition-all"
                                        >
                                            Waive Advance Payment
                                        </button>
                                    </div>
                                )}

                                {project.advanceWaived && (
                                    <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                                        <Check size={14} className="text-green-500" />
                                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider text-center flex-1">Advance Waived by Artist</span>
                                    </div>
                                )}

                                {payments.length === 0 && !project.advanceWaived && (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">No payments recorded yet.</p>
                                )}

                                {payments.map(p => (
                                    <div key={p._id} className="p-4 border border-muted rounded-xl bg-background space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-accent tracking-wider">{p.type}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.status === 'approved' ? 'border-green-600/50 text-green-500' :
                                                    p.status === 'rejected' ? 'border-red-600/50 text-red-500' : 'border-yellow-600/50 text-yellow-500'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>

                                        {p.paymentMode === 'upi' ? (
                                            <div
                                                className="relative group cursor-zoom-in"
                                                onClick={() => setSelectedImage(p.screenshotUrl)}
                                            >
                                                <img src={p.screenshotUrl} className="w-full rounded-lg h-32 object-cover border border-muted" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded">Click to View Full</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8 bg-muted/20 border border-muted border-dashed rounded-xl flex flex-col items-center justify-center gap-2">
                                                <CreditCard size={24} className="text-accent/40" />
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-white capitalize">{p.paymentMode} Payment</p>

                                                </div>
                                            </div>
                                        )}

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

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 animate-in fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center">
                        <button
                            className="absolute top-0 right-0 md:-top-10 md:-right-10 text-white hover:text-accent p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <ImageIcon size={32} />
                        </button>
                        <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        <p className="text-white/40 text-xs mt-4 uppercase tracking-[0.5em]">Click anywhere to close</p>
                    </div>
                </div>
            )}
        </div>
    );
}
