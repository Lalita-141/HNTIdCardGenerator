import React, { useState } from 'react';
import useEmployee from './hooks/useEmployee';
import EmployeeFormPanel from './components/EmployeeFormPanel';
import IDCardPreviewPanel from './components/IDCardPreviewPanel';
import './IdCardPage.css';

const IdCardPage = () => {
    const [staffId, setStaffId] = useState('');
    const [customPhoto, setCustomPhoto] = useState(null);
    const { employee, loading, error, fetchEmployee } = useEmployee();

    const handleGenerate = () => {
        if (staffId.trim()) {
            fetchEmployee(staffId.trim());
        }
    };

    return (
        <main className="icp">
            {/* Left panel */}
            <section className="icp__panel icp__panel--left" aria-label="ID Card Generator Form">
                <EmployeeFormPanel
                    staffId={staffId}
                    onStaffIdChange={setStaffId}
                    employee={employee}
                    loading={loading}
                    error={error}
                    onGenerate={handleGenerate}
                    customPhoto={customPhoto}
                    onPhotoUpload={setCustomPhoto}
                />
            </section>

            {/* Right panel */}
            <section className="icp__panel icp__panel--right" aria-label="ID Card Preview">
                <IDCardPreviewPanel employee={employee} customPhoto={customPhoto} />
            </section>

            {/* Decorative background elements */}
            <div className="icp__deco" aria-hidden="true">
                <div className="icp__deco-blob icp__deco-blob--tr" />
                <div className="icp__deco-blob icp__deco-blob--bl" />
                <div className="icp__deco-dots" />
            </div>
        </main>
    );
};

export default IdCardPage;
