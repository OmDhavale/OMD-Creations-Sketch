"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/ProjectCard';
import { Search, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter(p => 
    p.mandalName.toLowerCase().includes(search.toLowerCase()) ||
    p.year.includes(search)
  );

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 md:p-10 pt-24 lg:pt-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Artist Dashboard</h2>
            <p className="text-muted-foreground text-sm">Manage your Ganesh murti projects</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search mandal or year..." 
              className="w-full bg-card border border-muted rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-muted rounded-2xl">
                <p className="text-muted-foreground italic">No projects found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
