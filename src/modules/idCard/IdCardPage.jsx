import React, { useState, useEffect } from 'react';
import useEmployee from './hooks/useEmployee';
import EmployeeFormPanel from './components/EmployeeFormPanel';
import IDCardPreviewPanel from './components/IDCardPreviewPanel';
import { formatProfileImage } from '../../utils/imageUtils';
import { removeBgAndFramePassport } from '../../utils/photoProcessor';
import './IdCardPage.css';

const IdCardPage = () => {
    const [staffId, setStaffId] = useState('');
    const [customPhoto, setCustomPhoto] = useState(null);
    const [processedPhoto, setProcessedPhoto] = useState(null);
    const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
    const { employee, loading, error, fetchEmployee } = useEmployee();

    // Reset custom and processed photo whenever a new employee is loaded from API
    useEffect(() => {
        if (employee) {
            setCustomPhoto(null);
            setProcessedPhoto(null);
        }
    }, [employee?.staffId]);

    const rawPhoto = customPhoto
        ? customPhoto
        : formatProfileImage(employee?.profilePicture);

    useEffect(() => {
        let cancelled = false;

        if (!rawPhoto) {
            setProcessedPhoto(null);
            setIsProcessingPhoto(false);
            return;
        }

        setIsProcessingPhoto(true);

        removeBgAndFramePassport(rawPhoto)
            .then((result) => {
                if (!cancelled) {
                    setProcessedPhoto(result);
                    setIsProcessingPhoto(false);
                }
            })
            .catch((err) => {
                console.error('Background removal failed:', err);
                if (!cancelled) {
                    setProcessedPhoto(rawPhoto);
                    setIsProcessingPhoto(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [rawPhoto]);

    const handleGenerate = () => {
        if (staffId.trim()) {
            setCustomPhoto(null);
            setProcessedPhoto(null);
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
                    processedPhoto={processedPhoto}
                    isProcessingPhoto={isProcessingPhoto}
                />
            </section>

            {/* Right panel */}
            <section className="icp__panel icp__panel--right" aria-label="ID Card Preview">
                <IDCardPreviewPanel
                    employee={employee}
                    customPhoto={customPhoto}
                    processedPhoto={processedPhoto}
                    isProcessingPhoto={isProcessingPhoto}
                />
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
