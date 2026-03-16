"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ImagePlay, Trash2, Copy, CheckCircle, Upload, Loader2, PlusCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    
    // Upload State
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [imageB64, setImageB64] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await fetch('/api/gallery');
            if (res.ok) {
                const data = await res.json();
                setImages(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Convert to base64 for API
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageB64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!imageB64) return;
        
        setUploading(true);
        try {
            const res = await fetch('/api/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageB64, title })
            });
            
            if (res.ok) {
                const newImg = await res.json();
                setImages([newImg, ...images]);
                
                // Reset form
                setShowUpload(false);
                setPreviewUrl('');
                setImageB64('');
                setTitle('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this portfolio image? This will remove it from the public gallery.")) return;
        
        try {
            // Optimistic update
            setImages(images.filter(img => img._id !== id));
            
            await fetch('/api/gallery', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (error) {
            console.error("Failed to delete", error);
            fetchGallery(); // revert on error
        }
    };

    const copyPublicLink = () => {
        const url = `${window.location.origin}/gallery`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            
            <main className="flex-1 lg:ml-64 pt-24 lg:pt-10 p-6 lg:p-10 transition-all duration-300">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-muted p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-accent/10 text-accent rounded-2xl">
                                <ImagePlay size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-white mb-1">My Sketches</h1>
                                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                                    Manage your public portfolio gallery
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={copyPublicLink}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-muted/50 hover:bg-muted text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                            >
                                {copied ? <CheckCircle size={16} className="text-accent" /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button 
                                onClick={() => setShowUpload(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-bold uppercase tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                            >
                                <PlusCircle size={16} />
                                Add Upload
                            </button>
                        </div>
                    </div>

                    {/* Upload Overlay */}
                    {showUpload && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-card w-full max-w-md rounded-3xl border border-muted p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                    onClick={() => setShowUpload(false)}
                                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white bg-muted/20 hover:bg-muted/50 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                                
                                <div className="space-y-6">
                                    <div className="text-center space-y-1">
                                        <h2 className="text-2xl font-black text-white">Upload Sketch</h2>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Add to your public portfolio</p>
                                    </div>

                                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                                        {/* Image Selector */}
                                        <label className="flex flex-col items-center justify-center gap-3 p-2 h-64 border-2 border-dashed border-muted rounded-2xl hover:border-accent/40 cursor-pointer transition-all bg-muted/5 group relative overflow-hidden">
                                            {previewUrl ? (
                                                <>
                                                    <img src={previewUrl} className="w-full h-full object-cover rounded-xl" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-white font-bold tracking-widest uppercase text-xs">Change Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center flex flex-col items-center p-4">
                                                    <div className="p-4 bg-accent/10 rounded-full text-accent group-hover:scale-110 transition-transform mb-4">
                                                        <Upload size={32} />
                                                    </div>
                                                    <span className="text-[12px] text-white font-bold uppercase tracking-widest mb-1">Click to browse</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">JPEG, PNG, WEBP</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                        </label>

                                        {/* Optional Title */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Title (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                placeholder="e.g. Lalbaugcha Raja 2024"
                                                className="w-full bg-background border border-muted rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-accent shadow-inner"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={uploading || !imageB64}
                                            className="w-full py-4 bg-accent text-accent-foreground font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {uploading ? (
                                                <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                            ) : (
                                                <><Upload size={16} /> Publish to Gallery</>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-20 bg-card border border-muted rounded-3xl">
                            <ImagePlay className="mx-auto text-muted-foreground mb-4 opacity-50" size={48} />
                            <h3 className="text-lg font-bold text-white mb-2">Portfolio is Empty</h3>
                            <p className="text-sm text-muted-foreground mb-6">Upload your best sketches to showcase them to Mandals.</p>
                            <button 
                                onClick={() => setShowUpload(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 hover:bg-muted text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                            >
                                <PlusCircle size={16} /> First Upload
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {images.map((img) => (
                                <div key={img._id} className="bg-card border border-muted rounded-2xl overflow-hidden group relative">
                                    <div className="aspect-[3/4] relative bg-[#0f0f0f]">
                                        <img 
                                            src={img.imageUrl} 
                                            alt={img.title || "Gallery Sketch"}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent pointer-events-none" />
                                        
                                        {/* Title (if exists) block */}
                                        {img.title && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="font-bold text-white text-sm leading-tight truncate drop-shadow-md">
                                                    {img.title}
                                                </h3>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Hover Overlay */}
                                    <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleDelete(img._id)}
                                            className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors hover:scale-110 active:scale-95"
                                            aria-label="Delete Image"
                                            title="Delete Image"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
