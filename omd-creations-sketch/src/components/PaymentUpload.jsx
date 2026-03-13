import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

const PaymentUpload = ({ projectId, type, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('type', type);

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
          <h4 className="font-bold text-accent">Proof Uploaded!</h4>
          <p className="text-sm text-muted-foreground text-pretty">Artist will verify your payment shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-muted p-6 rounded-xl">
      <h4 className="font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
        <Clock size={16} className="text-accent" />
        Upload {type} Payment Screenshot
      </h4>
      <form onSubmit={handleUpload} className="space-y-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-accent/50 transition-colors bg-background/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="text-muted-foreground mb-2" size={24} />
            <p className="text-xs text-muted-foreground">
              {file ? file.name : 'Click to upload screenshot'}
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </label>
        
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-3 bg-accent text-accent-foreground font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          {loading ? 'Uploading...' : `Submit ${type} Payment`}
        </button>
      </form>
    </div>
  );
};

export default PaymentUpload;
