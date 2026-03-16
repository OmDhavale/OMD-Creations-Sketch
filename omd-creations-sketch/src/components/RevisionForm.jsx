import React, { useState } from 'react';
import { Send, CheckCircle, Clock, ShieldAlert, CreditCard, Copy, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const RevisionForm = ({ projectId, revisionsUsed: staticUsed, revisionLimit, onSubmitted, artist, revisions = [] }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('small');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdPaidRevision, setCreatedPaidRevision] = useState(null);
  
  // Dynamically calculate used revisions based on actual non-paid requests in history
  const actualFreeUsed = revisions.filter(r => !r.isPaid).length;
  const revisionsUsed = actualFreeUsed;

  // Dynamic check for payment gating: newest first
  // We want the most recent revision that is either pending payment, pending approval, or rejected
  // But we filter by isPaid to ignore free ones
  // OVERRIDE with local state immediately after creation to prevent UI jumping
  const activeRevision = createdPaidRevision || [...revisions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .find(r => r.isPaid && r.paymentStatus !== 'approved' && r.paymentStatus !== 'none');
    
  const isRejected = activeRevision?.paymentStatus === 'rejected';

  const isLimitReached = revisionsUsed >= revisionLimit;

  const revisionTypes = [
    { id: 'small', label: 'Small', price: 20, desc: "Hand's shastra/weapon change" },
    { id: 'medium', label: 'Medium', price: 50, desc: "Backdrop or Aasana change" },
    { id: 'large', label: 'Large', price: 100, desc: "Complete Hand/Leg position change" },
    { id: 'xl', label: 'Extra Large', price: 200, desc: "Complete Pose change" },
    { id: 'xxl', label: 'XXL', price: 500, desc: "Complete Theme/Concept change" },
  ];

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    setLoading(true);
    try {
      const res = await fetch('/api/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            projectId, 
            message, 
            type: isLimitReached ? type : 'none' 
        }),
      });
      if (res.ok) {
        const newRev = await res.json();
        
        if (newRev.isPaid === true) {
            // Instant redirect to payment card
            setCreatedPaidRevision(newRev);
            setMessage('');
        } else {
            setSuccess(true);
            setMessage('');
        }

        if (onSubmitted) await onSubmitted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
      const revToPay = activeRevision;
      if (!revToPay) return;
      setLoading(true);
      try {
          const res = await fetch('/api/revision', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: revToPay._id,
                  paymentMode,
                  screenshotUrl
              })
          });
          if (res.ok) {
              setCreatedPaidRevision(null); // Back to prop tracking
              if (onSubmitted) await onSubmitted();
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const handleCancelRevision = async () => {
      const revToCancel = activeRevision;
      if (!revToCancel) return;
      if (!confirm("Are you sure you want to cancel this revision request?")) return;
      
      setLoading(true);
      try {
          const res = await fetch('/api/revision', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: revToCancel._id })
          });
          if (res.ok) {
              setCreatedPaidRevision(null);
              if (onSubmitted) await onSubmitted();
          }
      } catch (err) {
          console.error("Cancel failed", err);
      } finally {
          setLoading(false);
      }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'omd_creations');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setScreenshotUrl(data.secure_url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
      return (
        <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-600/30 text-center space-y-3 animate-in fade-in zoom-in">
          <div className="inline-flex p-3 bg-blue-600/20 rounded-full text-blue-400">
            <CheckCircle size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Request Sent!</h4>
            <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-medium">The artist has been notified and will work on your revision shortly.</p>
          </div>
        </div>
      );
  }

  // REJECTED STATE
  if (isRejected) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="inline-flex p-4 bg-red-500/20 rounded-full text-red-500">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Revision Rejected</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-medium px-4">
              Your revision payment was rejected. You cannot proceed further with more revisions. Please proceed with the current sketch.
            </p>
          </div>
        </div>
      );
  }

  // PENDING APPROVAL STATE
  if (activeRevision?.paymentStatus === 'pending_approval') {
      return (
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-3xl p-6 text-center space-y-4">
            <div className="inline-flex p-4 bg-yellow-500/10 rounded-full text-yellow-500 animate-pulse">
                <Clock size={32} />
            </div>
            <div className="space-y-1">
                <h4 className="font-bold text-white uppercase tracking-widest text-xs">Verification Pending</h4>
                <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-medium">
                    The artist is verifying your payment for the <span className="text-accent">{activeRevision.type}</span> revision. Please wait.
                </p>
            </div>
        </div>
      )
  }

  // PAYMENT REQUIRED STATE (Step 2 of Paid Revision)
  if (activeRevision?.paymentStatus === 'pending_payment') {
      const selectedType = revisionTypes.find(t => t.id === activeRevision.type);

      return (
        <section className="animate-in fade-in slide-in-from-bottom-4 relative">
            <div className="bg-card border border-muted rounded-3xl p-6 text-center space-y-6 border-t-4 border-t-accent shadow-xl relative overflow-hidden group/card">
                <div className="absolute -top-10 -right-10 bg-accent/10 w-32 h-32 rounded-full blur-3xl opacity-50" />
                
                <button 
                  onClick={handleCancelRevision}
                  disabled={loading}
                  className="absolute top-4 right-4 p-2 bg-muted/20 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 rounded-full transition-all opacity-70 hover:opacity-100 disabled:opacity-30 z-10"
                  aria-label="Cancel Revision Request"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="inline-flex p-5 bg-accent/20 rounded-full text-accent shadow-inner">
                    <CreditCard size={48} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Revision Payment</h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-black text-[10px]">
                        {selectedType?.label} Revision • {activeRevision.message.substring(0, 30)}...
                    </p>
                </div>

                <div className="py-5 px-6 bg-background rounded-2xl border border-muted flex flex-col items-center gap-2 shadow-inner">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Amount Due</span>
                    <span className="text-4xl font-black text-white">₹{activeRevision.amount}</span>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="p-4 bg-muted/20 rounded-2xl border border-muted flex justify-between items-center group active:scale-95 transition-transform">
                        <div className="text-left">
                            <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Studio UPI ID</p>
                            <p className="text-lg font-mono text-white select-all">{artist?.upiId}</p>
                        </div>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(artist?.upiId);
                                alert('UPI ID Copied!');
                            }}
                            className="p-4 bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground rounded-2xl transition-all shadow-lg active:scale-90"
                        >
                            <Copy size={24} />
                        </button>
                    </div>

                    {!showUpload ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {['upi', 'cash', 'cheque'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setPaymentMode(m)}
                                        className={cn(
                                            "py-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all",
                                            paymentMode === m ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-muted text-muted-foreground'
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setShowUpload(true)}
                                className="w-full py-4 bg-accent text-accent-foreground font-black rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                [ I HAVE PAID ]
                            </button>
                        </div>
                    ) : (
                        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-300 space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                                <Upload size={16} />
                                Confirm Payment
                            </h3>
                            
                            {paymentMode === 'upi' && (
                                <div className="space-y-3">
                                    <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-muted rounded-2xl hover:border-accent/40 cursor-pointer transition-all bg-muted/5 group">
                                        {uploading ? (
                                            <Loader2 className="animate-spin text-accent" />
                                        ) : screenshotUrl ? (
                                            <div className="relative group">
                                                <img src={screenshotUrl} className="w-32 h-32 object-cover rounded-xl border border-accent shadow-2xl shadow-accent/30" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                                    <Upload className="text-white" size={20} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-accent/10 rounded-full text-accent group-hover:scale-110 transition-transform">
                                                    <Upload size={24} />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Upload Screenshot</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    disabled={loading || uploading || (paymentMode === 'upi' && !screenshotUrl)}
                                    onClick={handlePaymentSubmit}
                                    className="w-full py-4 bg-accent text-accent-foreground font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : 'Submit Confirmation'}
                                    <Send size={14} />
                                </button>
                                <button 
                                    onClick={() => setShowUpload(false)}
                                    className="text-[10px] text-muted-foreground hover:text-white transition-colors uppercase font-bold tracking-widest mt-2"
                                >
                                    ← Back to instructions
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-2 font-medium pt-2">
                        <ShieldAlert size={10} className="text-accent" /> Artist will verify and unlock this revision.
                    </p>
                </div>
            </div>
        </section>
      )
  }

  return (
    <div className="bg-card border border-muted p-5 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-sm uppercase tracking-wider text-white">
          {isLimitReached ? 'Purchase Extra Revision' : 'Request Revision'}
        </h4>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter bg-muted/20 px-2 py-0.5 rounded">
                {revisionsUsed}/{revisionLimit} Free Used
            </span>
        </div>
      </div>
      
      {isLimitReached && (
          <div className="space-y-3 pt-2">
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Select Revision Type</p>
              <div className="grid grid-cols-1 gap-2">
                  {revisionTypes.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                            type === t.id 
                            ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/5' 
                            : 'bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase">{t.label}</span>
                                <span className="text-[10px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded">₹{t.price}</span>
                            </div>
                            {type === t.id && <CheckCircle size={12} />}
                        </div>
                        <p className="text-[9px] opacity-70 leading-tight uppercase font-medium tracking-tight">{t.desc}</p>
                      </button>
                  ))}
              </div>
          </div>
      )}

      <form onSubmit={handleInitialSubmit} className="space-y-4">
        <div className="space-y-2 text-left">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Notes / Description</p>
            <textarea
              className="w-full bg-background border border-muted rounded-xl p-4 text-[13px] text-white focus:outline-none focus:border-accent min-h-[120px] shadow-inner"
              placeholder="Be specific about the changes you need..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
        </div>
        
        <button
          type="submit"
          disabled={loading || !message}
          className="w-full py-4 bg-white hover:bg-white/90 text-black font-black uppercase tracking-widest text-xs rounded-xl disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg"
        >
          {loading ? 'Sending...' : isLimitReached ? `BUY REVISION AND SEND REQ (₹${revisionTypes.find(t => t.id === type)?.price})` : 'Send Free Request'}
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default RevisionForm;
