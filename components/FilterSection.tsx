'use client';

import { useState, ReactNode } from 'react';

interface FilterSectionProps {
    title: string;
    icon: string;
    children: ReactNode;
}

export function FilterSection({ title, icon, children }: FilterSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCollapsed(!isCollapsed);
    };
    
    return (
        <div className="filter-section">
            <h3 
                className="filter-section-title"
                onClick={handleToggle}
                style={{ cursor: 'pointer' }}
            >
                <i className={icon}></i>
                {title}
                <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'} filter-toggle`} style={{ marginLeft: 'auto' }}></i>
            </h3>
            {!isCollapsed && (
                <div className="filter-section-content">
                    {children}
                </div>
            )}
        </div>
    );
}

