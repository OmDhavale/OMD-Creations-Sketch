"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // I'll make sure this helper exists with a minor fix if needed

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Create Project', icon: PlusCircle, href: '/admin/create' },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Header / Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-muted z-50 p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-accent">OMD</h1>
                    <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Creations</span>
                </div>
                <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:text-white transition-colors">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar content */}
            <div className={cn(
                "w-64 bg-card border-r border-muted h-screen fixed left-0 top-0 p-6 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="mb-10 px-2 lg:block hidden">
                    <h1 className="text-2xl font-bold text-accent">OMD</h1>
                    <p className="text-xs text-muted-foreground tracking-widest uppercase">Creations</p>
                </div>

                <nav className="flex-1 space-y-2 mt-16 lg:mt-0">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group",
                                    isActive 
                                        ? "bg-accent/10 text-accent border border-accent/20" 
                                        : "text-muted-foreground hover:text-white hover:bg-muted/50 border border-transparent"
                                )}
                            >
                                <item.icon size={20} className={cn("transition-colors", isActive ? "text-accent" : "group-hover:text-accent")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-muted">
                    <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 transition-colors w-full text-left font-medium">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
