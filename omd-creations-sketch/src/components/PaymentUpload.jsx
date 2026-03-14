import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

const PaymentUpload = ({ projectId, type, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [paymentMode, setPaymentMode] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (paymentMode === 'upi' && !file) return;

    setLoading(true);
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('type', type);
    formData.append('paymentMode', paymentMode);

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-accent/10 border border-accent/20 rounded-xl flex flex-col items-center gap-3 text-center">
        <CheckCircle className="text-accent" size={48} />
        <div>
          <h4 className="font-bold text-accent">Payment Reported!</h4>
          <p className="text-sm text-muted-foreground text-pretty">Artist will verify your {paymentMode} payment shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-muted p-6 rounded-xl space-y-4">
      <h4 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
        <Clock size={16} className="text-accent" />
        Report {type} Payment
      </h4>

      <div className="grid grid-cols-3 gap-2">
        {['upi', 'cash', 'cheque'].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setPaymentMode(mode)}
            className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
              paymentMode === mode 
                ? "bg-accent border-accent text-accent-foreground shadow-lg shadow-accent/20" 
                : "bg-background border-muted text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {paymentMode === 'upi' ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-accent/50 transition-colors bg-background/50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="text-muted-foreground mb-2" size={24} />
              <p className="text-xs text-muted-foreground">
                {file ? file.name : 'Upload Payment Screenshot'}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </label>
        ) : (
          <div className="p-4 bg-muted/20 border border-muted border-dashed rounded-lg text-center">
            <p className="text-xs text-muted-foreground">
              Please hand over the {paymentMode} to the artist. Submit this form to notify the artist.
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={(paymentMode === 'upi' && !file) || loading}
          className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          {loading ? 'Submitting...' : `Submit ${paymentMode} Payment Notification`}
        </button>
      </form>
    </div>
  );
};

export default PaymentUpload;
