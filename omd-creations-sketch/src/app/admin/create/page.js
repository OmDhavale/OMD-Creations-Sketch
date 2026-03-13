"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mandalName: '',
    contactPerson: '',
    phone: '',
    year: new Date().getFullYear().toString(),
    theme: '',
    revisionLimit: 3,
    totalAmount: 0,
    advanceAmount: 0,
    concepts: [{ title: '', description: '' }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const project = await res.json();
        router.push(`/admin/project/${project._id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 md:p-10 pt-20 lg:pt-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-accent mb-6 transition-colors inline-flex text-sm">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="bg-card border border-muted rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/20 rounded-xl text-accent">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Create New Project</h2>
                <p className="text-muted-foreground text-sm">Fill in the details to start a new sketch project.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mandal Name</label>
                  <input 
                    required 
                    className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                    placeholder="e.g. Lalbaugcha Raja"
                    value={formData.mandalName}
                    onChange={(e) => setFormData({...formData, mandalName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Year</label>
                  <input 
                    required 
                    className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                  <input 
                    required 
                    className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <input 
                    required 
                    className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Theme / Concept</label>
                <input 
                  required 
                  className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                  placeholder="e.g. Traditional, Realistic, etc."
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Revision Limit</label>
                <input 
                  type="number"
                  required 
                  className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                  value={formData.revisionLimit}
                  onChange={(e) => setFormData({...formData, revisionLimit: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-accent uppercase tracking-widest">Initial Concepts (Protection Stage)</label>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, concepts: [...formData.concepts, { title: '', description: '' }]})}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    + Add Concept Proposal
                  </button>
                </div>
                {formData.concepts.map((concept, index) => (
                  <div key={index} className="p-4 bg-muted/20 border border-muted rounded-xl space-y-3">
                    <input 
                      required
                      placeholder="Concept Title (e.g. Traditional Sitting Pose)"
                      className="w-full bg-background border border-muted rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent"
                      value={concept.title}
                      onChange={(e) => {
                        const newConcepts = [...formData.concepts];
                        newConcepts[index].title = e.target.value;
                        setFormData({...formData, concepts: newConcepts});
                      }}
                    />
                    <textarea 
                      required
                      placeholder="Concept Description..."
                      className="w-full bg-background border border-muted rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent h-20"
                      value={concept.description}
                      onChange={(e) => {
                        const newConcepts = [...formData.concepts];
                        newConcepts[index].description = e.target.value;
                        setFormData({...formData, concepts: newConcepts});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-muted">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Total Budget (₹)</label>
                  <input 
                    type="number"
                    required 
                    className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Advance Amount (₹)</label>
                  <input 
                    type="number"
                    required 
                    className="w-full bg-background border border-muted rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                    value={formData.advanceAmount}
                    onChange={(e) => setFormData({...formData, advanceAmount: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent text-accent-foreground font-bold rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
              >
                {loading ? 'Creating Studio Gateway...' : (
                  <>
                    <Sparkles size={20} />
                    Create Professional Project
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
