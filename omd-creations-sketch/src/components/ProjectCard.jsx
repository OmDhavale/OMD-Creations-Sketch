import React from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { Calendar, User, Phone, Palette } from 'lucide-react';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-card border border-muted p-5 rounded-xl hover:border-accent/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
          {project.mandalName}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-accent" />
          <span>Year: {project.year}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="text-accent" />
          <span>{project.contactPerson}</span>
        </div>
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-accent" />
          <span className="truncate">Theme: {project.theme}</span>
        </div>
      </div>

      <Link 
        href={`/admin/project/${project._id}`}
        className="block w-full text-center py-2 bg-muted hover:bg-accent hover:text-accent-foreground text-white rounded-lg font-semibold transition-all"
      >
        Open Project
      </Link>
    </div>
  );
};

export default ProjectCard;
