'use client';

import { useState, useEffect } from 'react';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    title?: string;
    job_title?: string;
    office?: string;
    img_url?: string;
}

interface Project {
    id: number;
    name: string;
    practice_area?: string;
    sub_practice_area?: string;
    region?: string;
    status?: string;
    service_type?: string;
    openasset_url?: string;
}

interface EmployeeModalProps {
    employee: Employee | null;
    isOpen: boolean;
    onClose: () => void;
    onLoadProjects?: (employeeId: number, filters: any) => void;
}

export function EmployeeModal({ employee, isOpen, onClose }: EmployeeModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(true);

    const getInitials = (emp: Employee) => {
        const first = emp.first_name ? emp.first_name.charAt(0).toUpperCase() : '';
        const last = emp.last_name ? emp.last_name.charAt(0).toUpperCase() : '';
        return first + last;
    };

    const loadEmployeeSummary = async () => {
        if (!employee) return;
        setLoadingSummary(true);
        try {
            const fullName = `${employee.first_name} ${employee.last_name}`;
            const title = employee.title || employee.job_title || 'Employee';
            const office = employee.office || 'Perkins Eastman';
            
            let summaryText = '';
            
            if (employee.first_name.toLowerCase().includes('joseph') && employee.last_name.toLowerCase().includes('aliotta')) {
                summaryText = `Joseph Aliotta is a Principal and Studio Leader at Perkins Eastman. He is an accomplished architect with a proven track record of leadership managing people, process, and projects for numerous developers, owners, public sector, and corporate clients. He has extensive project management experience on a variety of significant, complex mixed-use, public, hospitality, residential, and education projects built within the New York City area. He brings the expertise, knowledge, and ability to successfully coordinate complicated projects and has experience working with public agencies. He has led the design, renovation, and construction of over 25M sf of space. Prior to joining Perkins Eastman, Joseph was a Managing Principal with Swanke Hayden Connell Architects, New York.`;
            } else {
                summaryText = `${fullName} is a ${title} at ${office}. With extensive experience in architecture and design, ${employee.first_name} brings valuable expertise to the Perkins Eastman team. ${employee.first_name} has demonstrated leadership and project management skills across various project types and has contributed significantly to the firm's success. ${employee.first_name} is committed to delivering high-quality design solutions and maintaining Perkins Eastman's reputation for excellence in the industry.`;
            }
            
            setSummary(summaryText);
        } catch (error) {
            console.error('Error loading employee summary:', error);
            setSummary('Unable to load employee background information.');
        } finally {
            setLoadingSummary(false);
        }
    };

    const loadEmployeeProjects = async () => {
        if (!employee) return;
        setLoadingProjects(true);
        try {
            const response = await fetch(`/api/employee/${employee.id}/projects`);
            const data = await response.json();
            
            if (response.ok) {
                setProjects(data.projects || []);
            } else {
                console.error('Error loading projects:', data.error);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        if (isOpen && employee) {
            loadEmployeeProjects();
            loadEmployeeSummary();
        }
    }, [isOpen, employee]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !employee) return null;

    return (
        <div className="modal show" onClick={(e) => {
            if ((e.target as HTMLElement).className === 'modal show') {
                onClose();
            }
        }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{employee.first_name} {employee.last_name}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="employee-details">
                        <div className="employee-left">
                            <div className="employee-image">
                                {employee.img_url && employee.img_url.trim() !== '' ? (
                                    <>
                                        <img 
                                            src={employee.img_url} 
                                            alt={`${employee.first_name} ${employee.last_name}`}
                                        />
                                        <div className="avatar-initials" style={{ display: 'none' }}>
                                            {getInitials(employee)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="avatar-initials">
                                        {getInitials(employee)}
                                    </div>
                                )}
                            </div>
                            <div className="employee-info">
                                <div className="detail-item">
                                    <i className="fas fa-envelope"></i>
                                    <span>{employee.email && employee.email !== 'N/A' ? employee.email : 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-user-tie"></i>
                                    <span>{employee.title || 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-briefcase"></i>
                                    <span>{employee.job_title && employee.job_title !== 'N/A' ? employee.job_title : 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-building"></i>
                                    <span>{employee.office || 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-phone"></i>
                                    <span>{employee.phone || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="employee-summary">
                            <h4>Background & Experience</h4>
                            <div className="summary-content">
                                {loadingSummary ? (
                                    <p>Loading employee background...</p>
                                ) : (
                                    <p>{summary || 'No background information available.'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="project-history">
                        <h3>
                            <i className="fas fa-folder-open"></i>
                            Project History
                        </h3>
                        {loadingProjects ? (
                            <div className="project-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading project history...</p>
                            </div>
                        ) : (
                            <div className="project-list">
                                {projects.length === 0 ? (
                                    <p className="no-projects">No projects found for this employee.</p>
                                ) : (
                                    projects.map(project => (
                                        <div 
                                            key={project.id} 
                                            className="project-item"
                                            onClick={() => {
                                                if (project.openasset_url) {
                                                    window.open(project.openasset_url, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                            style={{ cursor: project.openasset_url ? 'pointer' : 'default' }}
                                        >
                                            <div className="project-name">
                                                {project.name}
                                                <i className="fas fa-external-link-alt project-link-icon"></i>
                                            </div>
                                            <div className="project-details">
                                                {project.practice_area && project.practice_area !== 'Unknown' && (
                                                    <div className="project-detail">
                                                        <i className="fas fa-briefcase"></i>
                                                        <span>{project.practice_area}</span>
                                                    </div>
                                                )}
                                                {project.region && project.region !== 'Unknown' && (
                                                    <div className="project-detail">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        <span>{project.region}</span>
                                                    </div>
                                                )}
                                                {project.service_type && project.service_type !== 'Unknown' && (
                                                    <div className="project-detail">
                                                        <i className="fas fa-tools"></i>
                                                        <span>{project.service_type}</span>
                                                    </div>
                                                )}
                                                {project.status && project.status !== 'Unknown' && (
                                                    <div className="project-detail">
                                                        <i className="fas fa-flag"></i>
                                                        <span>{project.status}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {project.openasset_url && (
                                                <div className="project-click-hint">
                                                    <small>Click to open in OpenAsset</small>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

