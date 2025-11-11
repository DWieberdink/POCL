'use client';

import { useState, useEffect, useRef } from 'react';

interface MultiSelectProps {
    id: string;
    label: string;
    icon: string;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    value: string[];
    onChange: (value: string[]) => void;
}

export function MultiSelect({ id, label, icon, placeholder, options, value, onChange }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const selectedValues = Array.isArray(value) ? value : [];
    const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

    const toggleOption = (optionValue: string) => {
        const newValue = selectedValues.includes(optionValue)
            ? selectedValues.filter(v => v !== optionValue)
            : [...selectedValues, optionValue];
        onChange(newValue);
    };

    const removeOption = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation();
        onChange(selectedValues.filter(v => v !== optionValue));
    };

    return (
        <div className="filter-group">
            <label htmlFor={id}>
                <i className={icon}></i>
                {label}
            </label>
            <div className="multi-select-container" ref={containerRef}>
                <div 
                    className={`multi-select-display ${isOpen ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    {selectedOptions.length === 0 ? (
                        <span className="placeholder">{placeholder}</span>
                    ) : (
                        <div className="selected-items">
                            {selectedOptions.map(opt => (
                                <span key={opt.value} className="selected-item">
                                    {opt.label}
                                    <span 
                                        className="remove" 
                                        onClick={(e) => removeOption(e, opt.value)}
                                    >×</span>
                                </span>
                            ))}
                        </div>
                    )}
                    <i className="fas fa-chevron-down"></i>
                </div>
                {isOpen && (
                    <div className="multi-select-dropdown">
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                className={`multi-select-option ${selectedValues.includes(opt.value) ? 'selected' : ''}`}
                                onClick={() => toggleOption(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                )}
                <select 
                    id={id}
                    multiple 
                    style={{ display: 'none' }}
                    value={selectedValues}
                    onChange={() => {}}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

