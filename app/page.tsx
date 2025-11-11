'use client';

import { useState, useEffect } from 'react';
import { MultiSelect } from '@/components/MultiSelect';
import { FilterSection } from '@/components/FilterSection';
import { EmployeeCard } from '@/components/EmployeeCard';
import { EmployeeModal } from '@/components/EmployeeModal';

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

interface User {
    name?: string;
    email?: string;
    authenticated?: boolean;
}

const studioOptions = [
    { value: '', label: 'All Studios' },
    { value: 'Austin Accounting', label: 'Austin Accounting' },
    { value: 'Austin Marketing', label: 'Austin Marketing' },
    { value: 'Austin Studio 01', label: 'Austin Studio 01' },
    { value: 'BFJ Studio 01', label: 'BFJ Studio 01' },
    { value: 'Boston Marketing', label: 'Boston Marketing' },
    { value: 'Boston Operations', label: 'Boston Operations' },
    { value: 'Boston Studio 01', label: 'Boston Studio 01' },
    { value: 'Boston Sustainability Team', label: 'Boston Sustainability Team' },
    { value: 'Boston Technical Resources', label: 'Boston Technical Resources' },
    { value: 'Chicago IT', label: 'Chicago IT' },
    { value: 'Chicago Marketing', label: 'Chicago Marketing' },
    { value: 'Chicago Operations', label: 'Chicago Operations' },
    { value: 'Chicago Studio 01', label: 'Chicago Studio 01' },
    { value: 'Costa Mesa Accounting', label: 'Costa Mesa Accounting' },
    { value: 'Costa Mesa IT', label: 'Costa Mesa IT' },
    { value: 'Costa Mesa Marketing', label: 'Costa Mesa Marketing' },
    { value: 'Costa Mesa Studio CMC 01', label: 'Costa Mesa Studio CMC 01' },
    { value: 'DC Accounting', label: 'DC Accounting' },
    { value: 'DC Communication', label: 'DC Communication' },
    { value: 'DC Design Strategy', label: 'DC Design Strategy' },
    { value: 'DC IT', label: 'DC IT' },
    { value: 'DC Marketing', label: 'DC Marketing' },
    { value: 'DC Operations', label: 'DC Operations' },
    { value: 'DC Studio 01', label: 'DC Studio 01' },
    { value: 'DC SustainabilityTeam', label: 'DC SustainabilityTeam' },
    { value: 'Dallas Marketing', label: 'Dallas Marketing' },
    { value: 'Dallas Operations', label: 'Dallas Operations' },
    { value: 'Dallas Studio 01', label: 'Dallas Studio 01' },
    { value: 'Dallas Studio FP', label: 'Dallas Studio FP' },
    { value: 'Dubai Operations', label: 'Dubai Operations' },
    { value: 'Dubai Studio 01', label: 'Dubai Studio 01' },
    { value: 'Guayaquil  IT', label: 'Guayaquil  IT' },
    { value: 'Guayaquil Accounting', label: 'Guayaquil Accounting' },
    { value: 'Guayaquil Operations', label: 'Guayaquil Operations' },
    { value: 'Guayaquil Studio 01', label: 'Guayaquil Studio 01' },
    { value: 'Guayaquil Sustainability Team', label: 'Guayaquil Sustainability Team' },
    { value: 'Los Angeles Accounting', label: 'Los Angeles Accounting' },
    { value: 'Los Angeles Communications', label: 'Los Angeles Communications' },
    { value: 'Los Angeles HR', label: 'Los Angeles HR' },
    { value: 'Los Angeles IT', label: 'Los Angeles IT' },
    { value: 'Los Angeles Marketing', label: 'Los Angeles Marketing' },
    { value: 'Los Angeles Operations', label: 'Los Angeles Operations' },
    { value: 'Los Angeles Studio 01', label: 'Los Angeles Studio 01' },
    { value: 'Mumbai Accounting', label: 'Mumbai Accounting' },
    { value: 'Mumbai IT', label: 'Mumbai IT' },
    { value: 'Mumbai Marketing', label: 'Mumbai Marketing' },
    { value: 'Mumbai Operations', label: 'Mumbai Operations' },
    { value: 'Mumbai Studio 01', label: 'Mumbai Studio 01' },
    { value: 'NYC SustainabilityTeam', label: 'NYC SustainabilityTeam' },
    { value: 'New York Accounting', label: 'New York Accounting' },
    { value: 'New York Communication', label: 'New York Communication' },
    { value: 'New York Design Strategy', label: 'New York Design Strategy' },
    { value: 'New York Executive', label: 'New York Executive' },
    { value: 'New York Frank Design', label: 'New York Frank Design' },
    { value: 'New York HR', label: 'New York HR' },
    { value: 'New York IT', label: 'New York IT' },
    { value: 'New York Legal', label: 'New York Legal' },
    { value: 'New York Marketing', label: 'New York Marketing' },
    { value: 'New York Operations', label: 'New York Operations' },
    { value: 'New York Studio 01', label: 'New York Studio 01' },
    { value: 'New York Studio 06', label: 'New York Studio 06' },
    { value: 'New York Studio 12', label: 'New York Studio 12' },
    { value: 'New York Studio 14', label: 'New York Studio 14' },
    { value: 'New York Technical Resources', label: 'New York Technical Resources' },
    { value: 'Oakland Studio 01', label: 'Oakland Studio 01' },
    { value: 'PEA Emeritus', label: 'PEA Emeritus' },
    { value: 'PEA:DCA:00087', label: 'PEA:DCA:00087' },
    { value: 'PEA:KCM:KCM01', label: 'PEA:KCM:KCM01' },
    { value: 'PEA:SFO:00030', label: 'PEA:SFO:00030' },
    { value: 'PEA:SVA:00080', label: 'PEA:SVA:00080' },
    { value: 'PEC:FMW:00045', label: 'PEC:FMW:00045' },
    { value: 'PEDC Studio 01', label: 'PEDC Studio 01' },
    { value: 'Philadelphia Communications', label: 'Philadelphia Communications' },
    { value: 'Philadelphia IT', label: 'Philadelphia IT' },
    { value: 'Philadelphia Marketing', label: 'Philadelphia Marketing' },
    { value: 'Philadelphia Operations', label: 'Philadelphia Operations' },
    { value: 'Philadelphia Studio 01', label: 'Philadelphia Studio 01' },
    { value: 'Pittsburgh Accounting', label: 'Pittsburgh Accounting' },
    { value: 'Pittsburgh Communications', label: 'Pittsburgh Communications' },
    { value: 'Pittsburgh Design Strategy', label: 'Pittsburgh Design Strategy' },
    { value: 'Pittsburgh IT', label: 'Pittsburgh IT' },
    { value: 'Pittsburgh Marketing', label: 'Pittsburgh Marketing' },
    { value: 'Pittsburgh Operations', label: 'Pittsburgh Operations' },
    { value: 'Pittsburgh Studio 01', label: 'Pittsburgh Studio 01' },
    { value: 'Pittsburgh Sustainability', label: 'Pittsburgh Sustainability' },
    { value: 'Pittsburgh Technical Resources', label: 'Pittsburgh Technical Resources' },
    { value: 'RGR Studio 01', label: 'RGR Studio 01' },
    { value: 'Raleigh Accounting', label: 'Raleigh Accounting' },
    { value: 'Raleigh Charlotte Human Resources', label: 'Raleigh Charlotte Human Resources' },
    { value: 'Raleigh Marketing', label: 'Raleigh Marketing' },
    { value: 'Raleigh Studio 01', label: 'Raleigh Studio 01' },
    { value: 'San Francisco Accounting', label: 'San Francisco Accounting' },
    { value: 'San Francisco Design Strategy', label: 'San Francisco Design Strategy' },
    { value: 'San Francisco Human Resources', label: 'San Francisco Human Resources' },
    { value: 'San Francisco IT', label: 'San Francisco IT' },
    { value: 'San Francisco Marketing', label: 'San Francisco Marketing' },
    { value: 'San Francisco Operations', label: 'San Francisco Operations' },
    { value: 'San Francisco Studio 01', label: 'San Francisco Studio 01' },
    { value: 'Seattle Vancouver Accounting', label: 'Seattle Vancouver Accounting' },
    { value: 'Seattle Vancouver Marketing', label: 'Seattle Vancouver Marketing' },
    { value: 'Seattle Vancouver Operations', label: 'Seattle Vancouver Operations' },
    { value: 'Seattle Vancouver Studio 01', label: 'Seattle Vancouver Studio 01' },
    { value: 'Shanghai Accounting', label: 'Shanghai Accounting' },
    { value: 'Shanghai Marketing', label: 'Shanghai Marketing' },
    { value: 'Shanghai Operations', label: 'Shanghai Operations' },
    { value: 'Shanghai Studio 01', label: 'Shanghai Studio 01' },
    { value: 'Singapore HR', label: 'Singapore HR' },
    { value: 'Singapore Studio 01', label: 'Singapore Studio 01' },
    { value: 'Stamford IT', label: 'Stamford IT' },
    { value: 'Stamford Marketing', label: 'Stamford Marketing' },
    { value: 'Stamford Operations', label: 'Stamford Operations' },
    { value: 'Stamford Studio 01', label: 'Stamford Studio 01' },
    { value: 'Stamford Sustainability Team', label: 'Stamford Sustainability Team' },
    { value: 'Stamford Technical Resources', label: 'Stamford Technical Resources' },
    { value: 'Toronto Design Strategy', label: 'Toronto Design Strategy' },
    { value: 'Urbanomics Studio 01', label: 'Urbanomics Studio 01' }
];

const regionOptions = [
    { value: '', label: 'All Locations' },
    { value: 'East', label: 'East' },
    { value: 'West', label: 'West' },
    { value: 'Central', label: 'Central' },
    { value: 'International', label: 'International' }
];

const yearsExperienceOptions = [
    { value: '', label: 'All Experience Levels' },
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-15', label: '11-15 years' },
    { value: '16-20', label: '16-20 years' },
    { value: '21-25', label: '21-25 years' },
    { value: '26+', label: '26+ years' }
];

const yearsAtPEOptions = [
    { value: '', label: 'All PE Tenure' },
    { value: '0-1', label: '0-1 years' },
    { value: '2-3', label: '2-3 years' },
    { value: '4-5', label: '4-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-15', label: '11-15 years' },
    { value: '16-20', label: '16-20 years' },
    { value: '21+', label: '21+ years' }
];

const roleOptions = [
    { value: '', label: 'All Titles' },
    { value: 'Associate', label: 'Associate' },
    { value: 'Associate Principal', label: 'Associate Principal' },
    { value: 'Chairman', label: 'Chairman' },
    { value: 'Principal', label: 'Principal' },
    { value: 'Principal and Executive Director', label: 'Principal and Executive Director' },
    { value: 'Senior Associate', label: 'Senior Associate' }
];

const jobTitleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'Architect', label: 'Architect' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Project Architect', label: 'Project Architect' },
    { value: 'Interior Designer', label: 'Interior Designer' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Principal', label: 'Principal' },
    { value: 'Managing Principal', label: 'Managing Principal' },
    { value: 'Executive Director', label: 'Executive Director' },
    { value: 'Planner', label: 'Planner' },
    { value: 'Urban Planner', label: 'Urban Planner' },
    { value: 'Marketing Manager', label: 'Marketing Manager' },
    { value: 'Studio Administrator', label: 'Studio Administrator' },
    { value: 'Project Accountant', label: 'Project Accountant' },
    { value: 'Emerging Professional', label: 'Emerging Professional' }
];

export default function EmployeeDirectory() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    // Filter states
    const [nameSearch, setNameSearch] = useState('');
    const [practiceArea, setPracticeArea] = useState<string[]>([]);
    const [subPracticeArea, setSubPracticeArea] = useState<string[]>([]);
    const [region, setRegion] = useState<string[]>([]);
    const [studio, setStudio] = useState<string[]>([]);
    const [yearsExperience, setYearsExperience] = useState<string[]>([]);
    const [yearsAtPE, setYearsAtPE] = useState<string[]>([]);
    const [role, setRole] = useState<string[]>([]);
    const [jobTitle, setJobTitle] = useState<string[]>([]);
    
    // Options for dropdowns
    const [practiceAreaOptions, setPracticeAreaOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [subPracticeAreaOptions, setSubPracticeAreaOptions] = useState<Array<{ value: string; label: string }>>([]);

    // Load practice areas and sub-practice areas
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [practiceRes, subPracticeRes, userRes] = await Promise.all([
                    fetch('/api/practice-areas'),
                    fetch('/api/sub-practice-areas'),
                    fetch('/api/user')
                ]);
                
                if (practiceRes.ok) {
                    const data = await practiceRes.json();
                    setPracticeAreaOptions([
                        { value: '', label: 'All Project Types' },
                        ...(data.practice_areas || []).map((pa: string) => ({ value: pa, label: pa }))
                    ]);
                }
                
                if (subPracticeRes.ok) {
                    const data = await subPracticeRes.json();
                    setSubPracticeAreaOptions([
                        { value: '', label: 'All Sub-Practice Areas' },
                        ...(data.sub_practice_areas || []).map((spa: string) => ({ value: spa, label: spa }))
                    ]);
                }
                
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error loading options:', error);
            }
        };
        loadOptions();
    }, []);

    // Filter employees by name search
    useEffect(() => {
        if (!nameSearch.trim()) {
            setFilteredEmployees(employees);
        } else {
            const searchTerm = nameSearch.toLowerCase().trim();
            setFilteredEmployees(employees.filter(emp => {
                const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
                const firstName = emp.first_name.toLowerCase();
                const lastName = emp.last_name.toLowerCase();
                return fullName.includes(searchTerm) || 
                       firstName.includes(searchTerm) || 
                       lastName.includes(searchTerm);
            }));
        }
    }, [nameSearch, employees]);

    const searchEmployees = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params = new URLSearchParams();
            if (practiceArea.length > 0) params.append('practice_area', practiceArea.join(','));
            if (subPracticeArea.length > 0) params.append('sub_practice_area', subPracticeArea.join(','));
            if (region.length > 0) params.append('region', region.join(','));
            if (studio.length > 0) params.append('studio', studio.join(','));
            if (yearsExperience.length > 0) params.append('years_experience', yearsExperience.join(','));
            if (yearsAtPE.length > 0) params.append('years_at_pe', yearsAtPE.join(','));
            if (role.length > 0) params.append('role', role.join(','));
            if (jobTitle.length > 0) params.append('job_title', jobTitle.join(','));
            if (nameSearch.trim()) params.append('name_search', nameSearch.trim());
            
            const response = await fetch(`/api/employees?${params.toString()}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to search employees');
            }
            
            setEmployees(data.employees || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setEmployees([]);
        setFilteredEmployees([]);
        setNameSearch('');
        setPracticeArea([]);
        setSubPracticeArea([]);
        setRegion([]);
        setStudio([]);
        setYearsExperience([]);
        setYearsAtPE([]);
        setRole([]);
        setJobTitle([]);
        setError('');
    };

    const exportToExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (practiceArea.length > 0) params.append('practice_area', practiceArea.join(','));
            if (subPracticeArea.length > 0) params.append('sub_practice_area', subPracticeArea.join(','));
            if (region.length > 0) params.append('region', region.join(','));
            if (studio.length > 0) params.append('studio', studio.join(','));
            if (yearsExperience.length > 0) params.append('years_experience', yearsExperience.join(','));
            if (yearsAtPE.length > 0) params.append('years_at_pe', yearsAtPE.join(','));
            if (role.length > 0) params.append('role', role.join(','));
            if (jobTitle.length > 0) params.append('job_title', jobTitle.join(','));
            if (nameSearch.trim()) params.append('name_search', nameSearch.trim());
            
            const response = await fetch(`/api/export/employees?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error('Failed to export employees');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'perkins_eastman_employees.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            setError(`Failed to export: ${error.message}`);
        }
    };

    const openModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const hasFilters = practiceArea.length > 0 || subPracticeArea.length > 0 || region.length > 0 || 
                      studio.length > 0 || yearsExperience.length > 0 || yearsAtPE.length > 0 || 
                      role.length > 0 || jobTitle.length > 0 || nameSearch.trim();

    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <img src="/pe-logo.png" alt="Perkins Eastman" className="logo" />
                        <div className="header-text">
                            <h1>Employee Directory</h1>
                            <p className="tagline">Human by Design</p>
                        </div>
                        <div className="header-auth">
                            {user && (
                                <>
                                    <span className="user-name">{user.name || user.email}</span>
                                    <a href="/logout" className="btn btn-outline">Logout</a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <section className="search-section">
                        <div className="search-header">
                            <h2>Find Your Colleagues</h2>
                            <p>Search by name or use filters to explore our team</p>
                        </div>

                        <div className="name-search">
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search by name (e.g., 'Douwe', 'Smith')"
                                    value={nameSearch}
                                    onChange={(e) => setNameSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filters">
                            <FilterSection title="Filter by People Details" icon="fas fa-users">
                                <MultiSelect
                                    id="studioSelect"
                                    label="Studio/Office"
                                    icon="fas fa-building"
                                    placeholder="All Studios"
                                    options={studioOptions}
                                    value={studio}
                                    onChange={setStudio}
                                />
                                <MultiSelect
                                    id="yearsExperienceSelect"
                                    label="Years of Experience"
                                    icon="fas fa-calendar-alt"
                                    placeholder="All Experience Levels"
                                    options={yearsExperienceOptions}
                                    value={yearsExperience}
                                    onChange={setYearsExperience}
                                />
                                <MultiSelect
                                    id="yearsAtPESelect"
                                    label="Years at PE"
                                    icon="fas fa-building"
                                    placeholder="All PE Tenure"
                                    options={yearsAtPEOptions}
                                    value={yearsAtPE}
                                    onChange={setYearsAtPE}
                                />
                                <MultiSelect
                                    id="roleSelect"
                                    label="Title"
                                    icon="fas fa-user-tie"
                                    placeholder="All Titles"
                                    options={roleOptions}
                                    value={role}
                                    onChange={setRole}
                                />
                                <MultiSelect
                                    id="jobTitleSelect"
                                    label="Job Title"
                                    icon="fas fa-briefcase"
                                    placeholder="All Roles"
                                    options={jobTitleOptions}
                                    value={jobTitle}
                                    onChange={setJobTitle}
                                />
                            </FilterSection>

                            <FilterSection title="Filter by Project Details" icon="fas fa-folder-open">
                                <MultiSelect
                                    id="practiceAreaSelect"
                                    label="Project Type (Practice Area)"
                                    icon="fas fa-briefcase"
                                    placeholder="All Project Types"
                                    options={practiceAreaOptions}
                                    value={practiceArea}
                                    onChange={setPracticeArea}
                                />
                                <MultiSelect
                                    id="subPracticeAreaSelect"
                                    label="Sub-Practice Area"
                                    icon="fas fa-layer-group"
                                    placeholder="All Sub-Practice Areas"
                                    options={subPracticeAreaOptions}
                                    value={subPracticeArea}
                                    onChange={setSubPracticeArea}
                                />
                                <MultiSelect
                                    id="regionSelect"
                                    label="Region"
                                    icon="fas fa-map-marker-alt"
                                    placeholder="All Locations"
                                    options={regionOptions}
                                    value={region}
                                    onChange={setRegion}
                                />
                            </FilterSection>
                        </div>

                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={searchEmployees} disabled={loading}>
                                <i className="fas fa-search"></i>
                                {loading ? 'Searching...' : 'Search Employees'}
                            </button>
                            <button className="btn btn-outline" onClick={clearResults}>
                                <i className="fas fa-times"></i>
                                Clear Results
                            </button>
                            {employees.length > 0 && (
                                <button className="btn btn-export" onClick={exportToExcel}>
                                    <i className="fas fa-file-excel"></i>
                                    Export Excel
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="results-section">
                        <div className="results-header">
                            <h3>
                                {hasFilters ? `Filtered Results` : employees.length > 0 ? 'All Employees' : 'Ready to Search'}
                            </h3>
                            <div className="results-count">
                                {employees.length > 0 
                                    ? `${filteredEmployees.length} employees found`
                                    : 'Click "Search Employees" to start'
                                }
                            </div>
                        </div>

                        {loading && (
                            <div className="loading">
                                <div className="loading-spinner"></div>
                                <p>Loading employees...</p>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        {!loading && !error && (
                            <div className="employees-grid">
                                {filteredEmployees.length === 0 && employees.length > 0 ? (
                                    <div className="no-results">
                                        <i className="fas fa-search"></i>
                                        <p>No employees found matching your search.</p>
                                    </div>
                                ) : filteredEmployees.length === 0 ? (
                                    <div className="no-results">
                                        <i className="fas fa-search"></i>
                                        <p>No employees found. Try adjusting your filters.</p>
                                    </div>
                                ) : (
                                    filteredEmployees.map(emp => (
                                        <EmployeeCard
                                            key={emp.id}
                                            employee={emp}
                                            onClick={openModal}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <EmployeeModal
                employee={selectedEmployee}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}
