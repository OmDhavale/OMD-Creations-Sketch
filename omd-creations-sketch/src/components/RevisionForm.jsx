import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const RevisionForm = ({ projectId, revisionsUsed, revisionLimit, onSubmitted }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    setLoading(true);
    try {
      const res = await fetch('/api/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message }),
      });
      if (res.ok) {
        setSuccess(true);
        setMessage('');
        if (onSubmitted) onSubmitted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (revisionsUsed >= revisionLimit) {
    return (
      <div className="bg-muted/20 p-4 rounded-lg border border-muted text-center text-sm text-muted-foreground">
        Revision limit reached ({revisionsUsed}/{revisionLimit}).
      </div>
    );
  }

  if (success) {
      return (
        <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-600/30 text-center flex items-center justify-center gap-2 text-blue-400">
          <CheckCircle size={18} />
          <span>Revision request sent!</span>
        </div>
      );
  }

  return (
    <div className="bg-card border border-muted p-5 rounded-xl">
      <h4 className="font-bold mb-4 flex justify-between items-center text-sm uppercase tracking-wider">
        Request Revision
        <span className="text-xs text-muted-foreground font-normal">
            {revisionsUsed}/{revisionLimit} used
        </span>
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full bg-background border border-muted rounded-lg p-3 text-sm focus:outline-none focus:border-accent min-h-[100px]"
          placeholder="What would you like us to change?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading || !message}
          className="w-full py-2 bg-white text-black font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          {loading ? 'Sending...' : 'Send Request'}
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default RevisionForm;
