'use client';

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

interface EmployeeCardProps {
    employee: Employee;
    onClick: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
    const getInitials = (emp: Employee) => {
        const first = emp.first_name ? emp.first_name.charAt(0).toUpperCase() : '';
        const last = emp.last_name ? emp.last_name.charAt(0).toUpperCase() : '';
        return first + last;
    };

    return (
        <div className="employee-card" onClick={() => onClick(employee)}>
            <div className="employee-header">
                <div className="employee-avatar">
                    {employee.img_url && employee.img_url.trim() !== '' ? (
                        <>
                            <img 
                                src={employee.img_url} 
                                alt={`${employee.first_name} ${employee.last_name}`}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const nextSibling = target.nextElementSibling as HTMLElement;
                                    if (nextSibling) {
                                        nextSibling.style.display = 'flex';
                                    }
                                }}
                                onLoad={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'block';
                                    const nextSibling = target.nextElementSibling as HTMLElement;
                                    if (nextSibling) {
                                        nextSibling.style.display = 'none';
                                    }
                                }}
                            />
                            <div className="avatar-initials" style={{ display: 'none' }}>
                                {getInitials(employee)}
                            </div>
                        </>
                    ) : (
                        <div className="avatar-initials">{getInitials(employee)}</div>
                    )}
                </div>
                <div className="employee-info">
                    <h4>{employee.first_name} {employee.last_name}</h4>
                    <p>{employee.title || employee.job_title || 'Employee'}</p>
                </div>
            </div>
            <div className="employee-details">
                {employee.email && employee.email !== 'N/A' && (
                    <div className="detail-item">
                        <i className="fas fa-envelope"></i>
                        <span>{employee.email}</span>
                    </div>
                )}
                {employee.office && (
                    <div className="detail-item">
                        <i className="fas fa-building"></i>
                        <span>{employee.office}</span>
                    </div>
                )}
                {employee.phone && (
                    <div className="detail-item">
                        <i className="fas fa-phone"></i>
                        <span>{employee.phone}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

