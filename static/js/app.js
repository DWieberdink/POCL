class EmployeeDirectory {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.allProjects = []; // Cache for all projects
        this.currentEmployeeId = null; // Current employee ID for modal projects
        this.initializeElements();
        this.bindEvents();
        this.initializeCompactMultiSelects();
        this.checkAuthentication(); // Check if user is authenticated
        this.loadPracticeAreas(); // Load practice areas (project types) dynamically
        this.loadSubPracticeAreas(); // Load sub-practice areas dynamically
    }
    
    async loadPracticeAreas() {
        try {
            const response = await fetch('/api/practice-areas');
            if (response.ok) {
                const data = await response.json();
                const practiceAreas = data.practice_areas || [];
                
                // Populate the dropdown
                const select = this.practiceAreaSelect;
                // Clear existing options except the first "All" option
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add practice areas
                practiceAreas.forEach(pa => {
                    const option = document.createElement('option');
                    option.value = pa;
                    option.textContent = pa;
                    select.appendChild(option);
                });
                
                // Re-initialize the multi-select to include new options
                this.createCompactMultiSelect(this.practiceAreaSelect, this.practiceAreaDisplay);
            }
        } catch (error) {
            console.log('Could not load practice areas:', error);
        }
    }
    
    async loadSubPracticeAreas() {
        try {
            const response = await fetch('/api/sub-practice-areas');
            if (response.ok) {
                const data = await response.json();
                const subPracticeAreas = data.sub_practice_areas || [];
                
                // Populate the dropdown
                const select = this.subPracticeAreaSelect;
                // Clear existing options except the first "All" option
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add sub-practice areas
                subPracticeAreas.forEach(spa => {
                    const option = document.createElement('option');
                    option.value = spa;
                    option.textContent = spa;
                    select.appendChild(option);
                });
                
                // Re-initialize the multi-select to include new options
                this.createCompactMultiSelect(this.subPracticeAreaSelect, this.subPracticeAreaDisplay);
            }
        } catch (error) {
            console.log('Could not load sub-practice areas:', error);
            // If it fails, the dropdown will just be empty (which is fine)
        }
    }
    
    async checkAuthentication() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const user = await response.json();
                // User is authenticated
                document.getElementById('userName').textContent = user.name || user.email;
                document.getElementById('userName').style.display = 'inline';
                document.getElementById('logoutBtn').style.display = 'inline-block';
            } else {
                // User is not authenticated - will be automatically redirected by backend
                // No login button needed, Azure AD will handle authentication automatically
                document.getElementById('logoutBtn').style.display = 'none';
                document.getElementById('userName').style.display = 'none';
            }
        } catch (error) {
            // If Azure AD is not configured, no action needed
            console.log('Auth check failed (may not be configured):', error);
        }
    }

    getSelectedValues(selectElement) {
        // Handle both single and multiple select dropdowns
        if (selectElement.multiple) {
            return Array.from(selectElement.selectedOptions)
                .map(option => option.value)
                .filter(value => value && value !== ''); // Filter out empty values
        } else {
            return selectElement.value ? [selectElement.value] : [];
        }
    }

    createCompactMultiSelect(selectElement, displayElement) {
        const container = selectElement.closest('.multi-select-container');
        let dropdown = container.querySelector('.multi-select-dropdown');
        
        if (!dropdown) {
            // Create dropdown if it doesn't exist
            dropdown = document.createElement('div');
            dropdown.className = 'multi-select-dropdown';
            dropdown.style.display = 'none';
            container.appendChild(dropdown);
        }

        // Populate dropdown with options
        dropdown.innerHTML = '';
        Array.from(selectElement.options).forEach(option => {
            if (option.value === '') return; // Skip "All..." option
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multi-select-option';
            optionDiv.textContent = option.text;
            optionDiv.dataset.value = option.value;
            
            if (option.selected) {
                optionDiv.classList.add('selected');
            }
            
            optionDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                option.selected = !option.selected;
                optionDiv.classList.toggle('selected', option.selected);
                this.updateDisplay(selectElement, displayElement);
            });
            
            dropdown.appendChild(optionDiv);
        });

        // Toggle dropdown
        displayElement.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = displayElement.classList.contains('active');
            
            // Close all other dropdowns
            document.querySelectorAll('.multi-select-display.active').forEach(display => {
                display.classList.remove('active');
                display.nextElementSibling.style.display = 'none';
            });
            
            if (!isActive) {
                displayElement.classList.add('active');
                dropdown.style.display = 'block';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            displayElement.classList.remove('active');
            dropdown.style.display = 'none';
        });
    }

    updateDisplay(selectElement, displayElement) {
        const selectedOptions = Array.from(selectElement.selectedOptions)
            .filter(option => option.value !== '');
        
        const placeholder = displayElement.querySelector('.placeholder');
        
        if (selectedOptions.length === 0) {
            placeholder.style.display = 'block';
            placeholder.textContent = selectElement.querySelector('option[value=""]').textContent;
            
            // Hide selected items when no selections
            let selectedItems = displayElement.querySelector('.selected-items');
            if (selectedItems) {
                selectedItems.style.display = 'none';
                selectedItems.innerHTML = '';
            }
        } else {
            placeholder.style.display = 'none';
            
            let selectedItems = displayElement.querySelector('.selected-items');
            if (!selectedItems) {
                selectedItems = document.createElement('div');
                selectedItems.className = 'selected-items';
                displayElement.insertBefore(selectedItems, displayElement.querySelector('i'));
            }
            
            selectedItems.style.display = 'block';
            selectedItems.innerHTML = '';
            selectedOptions.forEach(option => {
                const item = document.createElement('span');
                item.className = 'selected-item';
                item.innerHTML = `${option.text} <span class="remove" data-value="${option.value}">×</span>`;
                
                item.querySelector('.remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    option.selected = false;
                    this.updateDisplay(selectElement, displayElement);
                });
                
                selectedItems.appendChild(item);
            });
        }
    }

    initializeElements() {
        // Search and filter elements
        this.nameSearchInput = document.getElementById('nameSearch');
        this.practiceAreaSelect = document.getElementById('practiceAreaSelect');
        this.subPracticeAreaSelect = document.getElementById('subPracticeAreaSelect');
        this.regionSelect = document.getElementById('regionSelect');
        this.studioSelect = document.getElementById('studioSelect');
        this.yearsExperienceSelect = document.getElementById('yearsExperienceSelect');
        this.yearsAtPESelect = document.getElementById('yearsAtPESelect');
        this.roleSelect = document.getElementById('roleSelect');
        this.jobTitleSelect = document.getElementById('jobTitleSelect');
        this.statusSelect = document.getElementById('statusSelect');
        
        // Display elements for compact multi-select
        this.practiceAreaDisplay = document.getElementById('practiceAreaDisplay');
        this.subPracticeAreaDisplay = document.getElementById('subPracticeAreaDisplay');
        this.regionDisplay = document.getElementById('regionDisplay');
        this.studioDisplay = document.getElementById('studioDisplay');
        this.yearsExperienceDisplay = document.getElementById('yearsExperienceDisplay');
        this.yearsAtPEDisplay = document.getElementById('yearsAtPEDisplay');
        this.roleDisplay = document.getElementById('roleDisplay');
        this.jobTitleDisplay = document.getElementById('jobTitleDisplay');
        this.statusDisplay = document.getElementById('statusDisplay');
        
        // Action buttons
        this.searchBtn = document.getElementById('searchBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Results elements
        this.resultsTitle = document.getElementById('resultsTitle');
        this.resultsCount = document.getElementById('resultsCount');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.employeesGrid = document.getElementById('employeesGrid');
        
        // Modal project filter elements
        this.modalProjectPracticeArea = document.getElementById('modalProjectPracticeArea');
        this.modalProjectRegion = document.getElementById('modalProjectRegion');
        this.modalProjectStatus = document.getElementById('modalProjectStatus');
        
        // Modal project buttons
        this.modalLoadProjectsBtn = document.getElementById('modalLoadProjectsBtn');
        this.modalClearProjectsBtn = document.getElementById('modalClearProjectsBtn');
        
        // Modal project results elements
        this.modalProjectsResults = document.getElementById('modalProjectsResults');
        this.modalProjectsTitle = document.getElementById('modalProjectsTitle');
        this.modalProjectsCount = document.getElementById('modalProjectsCount');
        this.modalProjectsLoading = document.getElementById('modalProjectsLoading');
        this.modalProjectsGrid = document.getElementById('modalProjectsGrid');
        
        // Modal elements
        this.modal = document.getElementById('employeeModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalName = document.getElementById('modalName');
        this.modalImage = document.getElementById('modalImage');
        this.modalInitials = document.getElementById('modalInitials');
        this.modalEmail = document.getElementById('modalEmail');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalJobTitle = document.getElementById('modalJobTitle');
        this.modalOffice = document.getElementById('modalOffice');
        this.modalPhone = document.getElementById('modalPhone');
        this.modalSummary = document.getElementById('modalSummary');
        
        // Project history elements
        this.projectLoading = document.getElementById('projectLoading');
        this.projectList = document.getElementById('projectList');
    }

    bindEvents() {
        // Action buttons
        this.searchBtn.addEventListener('click', () => this.searchEmployees());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.exportBtn.addEventListener('click', () => this.exportToExcel());
        
        // Modal project buttons
        this.modalLoadProjectsBtn.addEventListener('click', () => this.loadModalProjects(this.currentEmployeeId));
        this.modalClearProjectsBtn.addEventListener('click', () => this.clearModalProjects());
        
        // Name search
        this.nameSearchInput.addEventListener('input', (e) => this.handleNameSearch(e));
        
        // Filter dropdowns
        this.practiceAreaSelect.addEventListener('change', () => this.handleFilterChange());
        this.subPracticeAreaSelect.addEventListener('change', () => this.handleFilterChange());
        this.regionSelect.addEventListener('change', () => this.handleFilterChange());
        this.studioSelect.addEventListener('change', () => this.handleFilterChange());
        this.yearsExperienceSelect.addEventListener('change', () => this.handleFilterChange());
        this.yearsAtPESelect.addEventListener('change', () => this.handleFilterChange());
        this.roleSelect.addEventListener('change', () => this.handleFilterChange());
        this.jobTitleSelect.addEventListener('change', () => this.handleFilterChange());
        this.statusSelect.addEventListener('change', () => this.handleFilterChange());
        
        // Modal events
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    async searchEmployees() {
        // Get selected values from multiple select dropdowns
        const practiceArea = this.getSelectedValues(this.practiceAreaSelect);
        const subPracticeArea = this.getSelectedValues(this.subPracticeAreaSelect);
        const region = this.getSelectedValues(this.regionSelect);
        const studio = this.getSelectedValues(this.studioSelect);
        const yearsExperience = this.getSelectedValues(this.yearsExperienceSelect);
        const yearsAtPE = this.getSelectedValues(this.yearsAtPESelect);
        const role = this.getSelectedValues(this.roleSelect);
        const jobTitle = this.getSelectedValues(this.jobTitleSelect);
        const status = this.getSelectedValues(this.statusSelect);
        const nameSearch = this.nameSearchInput.value.trim();
        
        // Determine search type
        const hasFilters = practiceArea.length > 0 || subPracticeArea.length > 0 || region.length > 0 || studio.length > 0 ||
                          yearsExperience.length > 0 || yearsAtPE.length > 0 || role.length > 0 || 
                          jobTitle.length > 0 || status.length > 0 || nameSearch;
        const searchType = hasFilters ? 'Filtered' : 'All';
        
        this.showLoading(hasFilters ? 'Searching employees with filters...' : 'Loading all employees...');
        
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
            if (status.length > 0) params.append('status', status.join(','));
            if (nameSearch) params.append('name_search', nameSearch);
            
            const response = await fetch(`/api/employees?${params.toString()}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to search employees');
            }
            
            this.employees = data.employees || [];
            this.filteredEmployees = [...this.employees];
            
            // Update results display
            if (hasFilters) {
                const filterCount = [practiceArea, subPracticeArea, region, studio, nameSearch].filter(Boolean).length;
                this.resultsTitle.textContent = `Filtered Results (${filterCount} filter${filterCount !== 1 ? 's' : ''} applied)`;
            } else {
                this.resultsTitle.textContent = 'All Employees';
            }
            this.resultsCount.textContent = `${this.employees.length} employees found`;
            
            this.renderEmployees();
            this.hideLoading();
            
            // Show export button if we have results
            this.updateExportButton();
            
        } catch (error) {
            console.error('Error searching employees:', error);
            this.showError(`Error searching employees: ${error.message}`);
        }
    }

    handleNameSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        
        if (!searchTerm) {
            // If no search term, show all loaded employees
            this.filteredEmployees = [...this.employees];
        } else {
            // Filter employees by name
            this.filteredEmployees = this.employees.filter(emp => {
                const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
                const firstName = emp.first_name.toLowerCase();
                const lastName = emp.last_name.toLowerCase();
                
                return fullName.includes(searchTerm) || 
                       firstName.includes(searchTerm) || 
                       lastName.includes(searchTerm);
            });
        }
        
        // Update results count
        this.resultsCount.textContent = `${this.filteredEmployees.length} employees found`;
        this.renderEmployees();
        
        // Update export button visibility
        this.updateExportButton();
    }

    handleFilterChange() {
        // When filters change, we need to re-run the search
        // This will be handled by the search button
    }

    initializeCompactMultiSelects() {
        // Initialize all compact multi-selects
        this.createCompactMultiSelect(this.practiceAreaSelect, this.practiceAreaDisplay);
        this.createCompactMultiSelect(this.subPracticeAreaSelect, this.subPracticeAreaDisplay);
        this.createCompactMultiSelect(this.regionSelect, this.regionDisplay);
        this.createCompactMultiSelect(this.studioSelect, this.studioDisplay);
        this.createCompactMultiSelect(this.yearsExperienceSelect, this.yearsExperienceDisplay);
        this.createCompactMultiSelect(this.yearsAtPESelect, this.yearsAtPEDisplay);
        this.createCompactMultiSelect(this.roleSelect, this.roleDisplay);
        this.createCompactMultiSelect(this.jobTitleSelect, this.jobTitleDisplay);
        this.createCompactMultiSelect(this.statusSelect, this.statusDisplay);
    }

    clearResults() {
        this.employees = [];
        this.filteredEmployees = [];
        this.employeesGrid.innerHTML = '';
        
        // Reset form
        this.nameSearchInput.value = '';
        
        // Clear multiple select dropdowns and update displays
        this.clearMultipleSelect(this.practiceAreaSelect, this.practiceAreaDisplay);
        this.clearMultipleSelect(this.subPracticeAreaSelect, this.subPracticeAreaDisplay);
        this.clearMultipleSelect(this.regionSelect, this.regionDisplay);
        this.clearMultipleSelect(this.studioSelect, this.studioDisplay);
        this.clearMultipleSelect(this.yearsExperienceSelect, this.yearsExperienceDisplay);
        this.clearMultipleSelect(this.yearsAtPESelect, this.yearsAtPEDisplay);
        this.clearMultipleSelect(this.roleSelect, this.roleDisplay);
        this.clearMultipleSelect(this.jobTitleSelect, this.jobTitleDisplay);
        this.clearMultipleSelect(this.statusSelect, this.statusDisplay);
        
        // Reset UI
        this.resultsTitle.textContent = 'Ready to Search';
        this.resultsCount.textContent = 'Click "Search Employees" to start';
        this.hideError();
        
        // Hide export button
        this.updateExportButton();
    }

    clearMultipleSelect(selectElement, displayElement) {
        // Clear all selections in a multiple select dropdown
        Array.from(selectElement.options).forEach(option => {
            option.selected = false;
        });
        
        // Use the standard updateDisplay function to ensure consistency
        this.updateDisplay(selectElement, displayElement);
    }

    updateExportButton() {
        // Show export button if we have employees to export
        if (this.employees && this.employees.length > 0) {
            this.exportBtn.style.display = 'inline-flex';
        } else {
            this.exportBtn.style.display = 'none';
        }
    }

    showSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }

    async exportToExcel() {
        try {
            // Get current filter values
            const practiceArea = this.getSelectedValues(this.practiceAreaSelect);
            const subPracticeArea = this.getSelectedValues(this.subPracticeAreaSelect);
            const region = this.getSelectedValues(this.regionSelect);
            const studio = this.getSelectedValues(this.studioSelect);
            const yearsExperience = this.getSelectedValues(this.yearsExperienceSelect);
            const yearsAtPE = this.getSelectedValues(this.yearsAtPESelect);
            const role = this.getSelectedValues(this.roleSelect);
            const jobTitle = this.getSelectedValues(this.jobTitleSelect);
            const status = this.getSelectedValues(this.statusSelect);
            const nameSearch = this.nameSearchInput.value.trim();
            
            // Build query parameters
            const params = new URLSearchParams();
            if (practiceArea.length > 0) params.append('practice_area', practiceArea.join(','));
            if (subPracticeArea.length > 0) params.append('sub_practice_area', subPracticeArea.join(','));
            if (region.length > 0) params.append('region', region.join(','));
            if (studio.length > 0) params.append('studio', studio.join(','));
            if (yearsExperience.length > 0) params.append('years_experience', yearsExperience.join(','));
            if (yearsAtPE.length > 0) params.append('years_at_pe', yearsAtPE.join(','));
            if (role.length > 0) params.append('role', role.join(','));
            if (jobTitle.length > 0) params.append('job_title', jobTitle.join(','));
            if (status.length > 0) params.append('status', status.join(','));
            if (nameSearch) params.append('name_search', nameSearch);
            
            // Show loading state
            this.exportBtn.disabled = true;
            this.exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            
            // Make request to export endpoint
            const response = await fetch(`/api/export/employees?${params.toString()}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to export employees');
            }
            
            // Get the filename from the response headers or create a default one
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'perkins_eastman_employees.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Show success message
            this.showSuccess(`Excel file exported successfully: ${filename}`);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError(`Failed to export Excel file: ${error.message}`);
        } finally {
            // Reset button state
            this.exportBtn.disabled = false;
            this.exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
        }
    }

    async loadModalProjects(employeeId = null) {
        const practiceArea = this.modalProjectPracticeArea.value;
        const region = this.modalProjectRegion.value;
        const status = this.modalProjectStatus.value;
        
        this.showModalProjectsLoading('Filtering projects...');
        this.modalProjectsResults.style.display = 'block';
        
        try {
            // If we have an employee ID, get only their projects
            if (employeeId) {
                console.log(`Loading projects for employee ${employeeId}...`);
                const response = await fetch(`/api/employee/${employeeId}/projects`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load employee projects');
                }
                
                this.allProjects = data.projects || [];
                console.log(`Found ${this.allProjects.length} projects for employee ${employeeId}`);
            } else {
                // Fallback to all projects if no employee ID
                console.log('Loading all projects for caching...');
                const response = await fetch('/api/projects');
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load projects');
                }
                
                this.allProjects = data.projects || [];
                console.log(`Cached ${this.allProjects.length} projects`);
            }
            
            // Debug: Show sample project data
            if (this.allProjects.length > 0) {
                console.log('Sample project data:', this.allProjects[0]);
                console.log('All regions found:', [...new Set(this.allProjects.map(p => p.region).filter(Boolean))]);
                console.log('All practice areas found:', [...new Set(this.allProjects.map(p => p.practice_area).filter(Boolean))]);
            } else {
                console.log('No projects loaded - check API response');
            }
            
            // Filter cached projects based on selected filters
            let filteredProjects = this.allProjects;
            
            console.log(`Starting with ${filteredProjects.length} employee projects`);
            console.log(`Filters applied: practiceArea=${practiceArea}, region=${region}, status=${status}`);
            
            if (practiceArea && practiceArea !== '') {
                const before = filteredProjects.length;
                filteredProjects = filteredProjects.filter(project => 
                    (project.practice_area || '').toLowerCase() === practiceArea.toLowerCase()
                );
                console.log(`After practice area filter (${practiceArea}): ${before} → ${filteredProjects.length}`);
            }
            
            if (region && region !== '') {
                const before = filteredProjects.length;
                filteredProjects = filteredProjects.filter(project => 
                    (project.region || '').toLowerCase() === region.toLowerCase()
                );
                console.log(`After region filter (${region}): ${before} → ${filteredProjects.length}`);
            }
            
            if (status && status !== '') {
                const before = filteredProjects.length;
                filteredProjects = filteredProjects.filter(project => 
                    (project.status || '').toLowerCase() === status.toLowerCase()
                );
                console.log(`After status filter (${status}): ${before} → ${filteredProjects.length}`);
            }
            
            // Update results display
            const filterCount = [practiceArea, region, status].filter(Boolean).length;
            if (filterCount > 0) {
                this.modalProjectsTitle.textContent = `Filtered Projects (${filterCount} filter${filterCount !== 1 ? 's' : ''} applied)`;
            } else {
                this.modalProjectsTitle.textContent = 'All Projects';
            }
            this.modalProjectsCount.textContent = `${filteredProjects.length} projects found`;
            
            this.renderModalProjects(filteredProjects);
            this.hideModalProjectsLoading();
            
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showModalProjectsError(`Error loading projects: ${error.message}`);
        }
    }

    renderModalProjects(projects) {
        if (projects.length === 0) {
            this.modalProjectsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--pe-gray-medium);">
                    <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No projects found matching your criteria.</p>
                </div>
            `;
            return;
        }

        this.modalProjectsGrid.innerHTML = projects.map(project => `
            <div class="modal-project-card" onclick="window.open('${project.openasset_url}', '_blank')">
                <div class="modal-project-header">
                    <h5>${project.name}</h5>
                    <i class="fas fa-external-link-alt project-link-icon"></i>
                </div>
                <div class="modal-project-details">
                    ${project.practice_area !== 'Unknown' ? `
                        <div class="project-detail">
                            <i class="fas fa-briefcase"></i>
                            <span>${project.practice_area}</span>
                        </div>
                    ` : ''}
                    ${project.region !== 'Unknown' ? `
                        <div class="project-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${project.region}</span>
                        </div>
                    ` : ''}
                    ${project.service_type !== 'Unknown' ? `
                        <div class="project-detail">
                            <i class="fas fa-tools"></i>
                            <span>${project.service_type}</span>
                        </div>
                    ` : ''}
                    ${project.status !== 'Unknown' ? `
                        <div class="project-detail">
                            <i class="fas fa-flag"></i>
                            <span>${project.status}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    clearModalProjects() {
        this.modalProjectsResults.style.display = 'none';
        this.modalProjectsGrid.innerHTML = '';
        
        // Reset modal project filters
        this.modalProjectPracticeArea.value = '';
        this.modalProjectRegion.value = '';
        this.modalProjectStatus.value = '';
        
        this.hideModalProjectsLoading();
    }

    showModalProjectsLoading(message = 'Loading projects...') {
        this.modalProjectsLoading.querySelector('p').textContent = message;
        this.modalProjectsLoading.style.display = 'block';
        this.modalProjectsGrid.innerHTML = '';
    }

    hideModalProjectsLoading() {
        this.modalProjectsLoading.style.display = 'none';
    }

    showModalProjectsError(message) {
        this.modalProjectsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--error-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
            </div>
        `;
        this.hideModalProjectsLoading();
    }

    renderEmployees() {
        if (this.filteredEmployees.length === 0) {
            this.employeesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--pe-gray-medium);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No employees found matching your criteria.</p>
                </div>
            `;
            return;
        }

        this.employeesGrid.innerHTML = this.filteredEmployees.map(emp => `
            <div class="employee-card" onclick="app.openModal(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
                <div class="employee-header">
                    <div class="employee-avatar">
                        ${emp.img_url && emp.img_url.trim() !== '' ? 
                            `<img src="${emp.img_url}" alt="${emp.first_name} ${emp.last_name}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                 onload="this.style.display='block'; this.nextElementSibling.style.display='none';">
                             <div class="avatar-initials" style="display: none;">${this.getInitials(emp)}</div>` :
                            `<div class="avatar-initials">${this.getInitials(emp)}</div>`
                        }
                    </div>
                    <div class="employee-info">
                        <h4>${emp.first_name} ${emp.last_name}</h4>
                        <p>${emp.title || emp.job_title || 'Employee'}</p>
                    </div>
                </div>
                <div class="employee-details">
                    ${emp.email && emp.email !== 'N/A' ? `
                        <div class="detail-item">
                            <i class="fas fa-envelope"></i>
                            <span>${emp.email}</span>
                        </div>
                    ` : ''}
                    ${emp.office ? `
                        <div class="detail-item">
                            <i class="fas fa-building"></i>
                            <span>${emp.office}</span>
                        </div>
                    ` : ''}
                    ${emp.phone ? `
                        <div class="detail-item">
                            <i class="fas fa-phone"></i>
                            <span>${emp.phone}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getInitials(employee) {
        const first = employee.first_name ? employee.first_name.charAt(0).toUpperCase() : '';
        const last = employee.last_name ? employee.last_name.charAt(0).toUpperCase() : '';
        return first + last;
    }

    async openModal(employee) {
        this.modalName.textContent = `${employee.first_name} ${employee.last_name}`;
        
        // Set current employee ID for modal projects
        this.currentEmployeeId = employee.id;
        
        // Set image
        if (employee.img_url && employee.img_url.trim() !== '') {
            this.modalImage.src = employee.img_url;
            this.modalImage.style.display = 'block';
            this.modalInitials.style.display = 'none';
        } else {
            this.modalImage.style.display = 'none';
            this.modalInitials.textContent = this.getInitials(employee);
            this.modalInitials.style.display = 'flex';
        }
        
        // Set details
        this.modalEmail.textContent = employee.email && employee.email !== 'N/A' ? employee.email : 'Not provided';
        this.modalTitle.textContent = employee.title || 'Not provided';
        this.modalJobTitle.textContent = employee.job_title && employee.job_title !== 'N/A' ? employee.job_title : 'Not provided';
        this.modalOffice.textContent = employee.office || 'Not provided';
        this.modalPhone.textContent = employee.phone || 'Not provided';
        
        // Load employee summary
        await this.loadEmployeeSummary(employee);
        
        // Show modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Load project history
        await this.loadEmployeeProjects(employee.id);
    }

    async loadEmployeeSummary(employee) {
        try {
            // For now, we'll create summaries based on employee data
            // In a real implementation, this would come from a database or API
            
            const fullName = `${employee.first_name} ${employee.last_name}`;
            const title = employee.title || employee.job_title || 'Employee';
            const office = employee.office || 'Perkins Eastman';
            
            // Generate a summary based on available data
            let summary = '';
            
            // Check if this is Joseph Aliotta specifically
            if (employee.first_name.toLowerCase().includes('joseph') && employee.last_name.toLowerCase().includes('aliotta')) {
                summary = `Joseph Aliotta is a Principal and Studio Leader at Perkins Eastman. He is an accomplished architect with a proven track record of leadership managing people, process, and projects for numerous developers, owners, public sector, and corporate clients. He has extensive project management experience on a variety of significant, complex mixed-use, public, hospitality, residential, and education projects built within the New York City area. He brings the expertise, knowledge, and ability to successfully coordinate complicated projects and has experience working with public agencies. He has led the design, renovation, and construction of over 25M sf of space. Prior to joining Perkins Eastman, Joseph was a Managing Principal with Swanke Hayden Connell Architects, New York.`;
            } else {
                // Generate a generic summary for other employees
                summary = `${fullName} is a ${title} at ${office}. With extensive experience in architecture and design, ${employee.first_name} brings valuable expertise to the Perkins Eastman team. ${employee.first_name} has demonstrated leadership and project management skills across various project types and has contributed significantly to the firm's success. ${employee.first_name} is committed to delivering high-quality design solutions and maintaining Perkins Eastman's reputation for excellence in the industry.`;
            }
            
            this.modalSummary.innerHTML = `<p>${summary}</p>`;
            
        } catch (error) {
            console.error('Error loading employee summary:', error);
            this.modalSummary.innerHTML = '<p>Unable to load employee background information.</p>';
        }
    }

    async loadEmployeeProjects(employeeId) {
        // Show loading state
        this.projectLoading.style.display = 'block';
        this.projectList.innerHTML = '';
        
        try {
            const response = await fetch(`/api/employee/${employeeId}/projects`);
            const data = await response.json();
            
            this.projectLoading.style.display = 'none';
            
            if (!response.ok) {
                this.projectList.innerHTML = `<p class="error">Error loading projects: ${data.error || 'Unknown error'}</p>`;
                return;
            }
            
            const projects = data.projects || [];
            
            if (projects.length === 0) {
                this.projectList.innerHTML = `<p class="no-projects">No projects found for this employee.</p><p class="project-message"><small>${data.message || 'This employee may not be associated with any projects in the system.'}</small></p>`;
                return;
            }
            
            // Display projects
            this.projectList.innerHTML = projects.map(project => `
                <div class="project-item" onclick="window.open('${project.openasset_url}', '_blank')">
                    <div class="project-name">
                        ${project.name}
                        <i class="fas fa-external-link-alt project-link-icon"></i>
                    </div>
                    <div class="project-details">
                        ${project.practice_area !== 'Unknown' ? `
                            <div class="project-detail">
                                <i class="fas fa-briefcase"></i>
                                <span>${project.practice_area}</span>
                            </div>
                        ` : ''}
                        ${project.region !== 'Unknown' ? `
                            <div class="project-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${project.region}</span>
                            </div>
                        ` : ''}
                        ${project.service_type !== 'Unknown' ? `
                            <div class="project-detail">
                                <i class="fas fa-tools"></i>
                                <span>${project.service_type}</span>
                            </div>
                        ` : ''}
                        ${project.status !== 'Unknown' ? `
                            <div class="project-detail">
                                <i class="fas fa-flag"></i>
                                <span>${project.status}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="project-click-hint">
                        <small>Click to open in OpenAsset</small>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading employee projects:', error);
            this.projectLoading.style.display = 'none';
            this.projectList.innerHTML = `<p class="error">Error loading projects: ${error.message}</p>`;
        }
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    showLoading(message = 'Loading...') {
        this.loadingIndicator.querySelector('p').textContent = message;
        this.loadingIndicator.style.display = 'block';
        this.employeesGrid.innerHTML = '';
        this.hideError();
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.hideLoading();
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize the application
const app = new EmployeeDirectory();
