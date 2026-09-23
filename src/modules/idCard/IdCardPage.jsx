import React, { useState, useEffect, useRef } from 'react';
import useEmployee from './hooks/useEmployee';
import useBulkGenerator from './hooks/useBulkGenerator';
import EmployeeFormPanel from './components/EmployeeFormPanel';
import BulkEmployeePanel from './components/BulkEmployeePanel';
import IDCardPreviewPanel from './components/IDCardPreviewPanel';
import { formatProfileImage } from '../../utils/imageUtils';
import { removeBgAndFramePassport } from '../../utils/photoProcessor';
import { getEmployeeById } from '../../api/employeeApi';
import './IdCardPage.css';

const IdCardPage = () => {
    const [mode, setMode] = useState('single'); // 'single' | 'bulk'
    const [staffId, setStaffId] = useState('');
    const [customPhoto, setCustomPhoto] = useState(null);
    const [processedPhoto, setProcessedPhoto] = useState(null);
    const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
    const [photoTransform, setPhotoTransform] = useState({ zoom: 1, x: 0, y: 0 });

    const [bulkPreviewEmployee, setBulkPreviewEmployee] = useState(null);

    const frontRef = useRef(null);
    const backRef = useRef(null);

    const { employee, loading, error, fetchEmployee } = useEmployee();

    // Callback when bulk generator or list item wants to preview an employee
    const handleSetBulkPreview = (empData, processed = null) => {
        setBulkPreviewEmployee(empData);
        if (processed) {
            setProcessedPhoto(processed);
            setIsProcessingPhoto(false);
        }
    };

    const bulkState = useBulkGenerator(handleSetBulkPreview);

    // Reset custom photo and transform when a new employee is loaded from API in single mode
    useEffect(() => {
        if (employee) {
            setCustomPhoto(null);
            setProcessedPhoto(null);
            setPhotoTransform({ zoom: 1, x: 0, y: 0 });
        }
    }, [employee?.staffId]);

    // Active employee displayed on the card
    const activeEmployee = mode === 'bulk'
        ? (bulkPreviewEmployee || employee)
        : employee;

    // Determine photo source
    const rawPhoto = customPhoto
        ? customPhoto
        : formatProfileImage(activeEmployee?.profilePicture);

    // Background removal whenever rawPhoto changes (when not in middle of bulk generation)
    useEffect(() => {
        let cancelled = false;

        // Skip effect while bulk generation is actively running (useBulkGenerator passes processed photo directly)
        if (bulkState.isGenerating) {
            return;
        }

        if (!rawPhoto) {
            setProcessedPhoto(null);
            setIsProcessingPhoto(false);
            setPhotoTransform({ zoom: 1, x: 0, y: 0 });
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
    }, [rawPhoto, bulkState.isGenerating]);

    const handleGenerate = () => {
        if (staffId.trim()) {
            setCustomPhoto(null);
            setProcessedPhoto(null);
            setPhotoTransform({ zoom: 1, x: 0, y: 0 });
            fetchEmployee(staffId.trim());
        }
    };

    const handlePhotoUpload = (photo) => {
        setCustomPhoto(photo);
        setPhotoTransform({ zoom: 1, x: 0, y: 0 });
    };

    // When clicking "View" on an employee row in bulk mode
    const handlePreviewEmployeeByCode = async (code) => {
        let empData = bulkState.employeeCache.current.get(code);
        if (!empData) {
            try {
                const res = await getEmployeeById(code);
                if (res.success && res.data) {
                    empData = res.data;
                    bulkState.employeeCache.current.set(code, empData);
                }
            } catch (err) {
                console.error('Fetch employee error:', err);
            }
        }
        if (empData) {
            setBulkPreviewEmployee(empData);
        }
    };

    return (
        <main className="icp">
            {/* Left panel: switches between Single mode and Bulk mode */}
            <section
                className={`icp__panel icp__panel--left ${mode === 'bulk' ? 'icp__panel--bulk' : ''}`}
                aria-label="ID Card Generator Controls"
            >
                {mode === 'single' ? (
                    <EmployeeFormPanel
                        staffId={staffId}
                        onStaffIdChange={setStaffId}
                        employee={employee}
                        loading={loading}
                        error={error}
                        onGenerate={handleGenerate}
                        customPhoto={customPhoto}
                        onPhotoUpload={handlePhotoUpload}
                        processedPhoto={processedPhoto}
                        isProcessingPhoto={isProcessingPhoto}
                        photoTransform={photoTransform}
                        onPhotoTransformChange={setPhotoTransform}
                        onSwitchMode={setMode}
                    />
                ) : (
                    <BulkEmployeePanel
                        onSwitchMode={setMode}
                        bulkState={bulkState}
                        frontRef={frontRef}
                        backRef={backRef}
                        onPreviewEmployee={handlePreviewEmployeeByCode}
                    />
                )}
            </section>

            {/* Right panel: ID Card Live Preview & Single Export */}
            <section className="icp__panel icp__panel--right" aria-label="ID Card Preview">
                <IDCardPreviewPanel
                    employee={activeEmployee}
                    customPhoto={customPhoto}
                    processedPhoto={processedPhoto}
                    isProcessingPhoto={isProcessingPhoto}
                    photoTransform={photoTransform}
                    onPhotoTransformChange={setPhotoTransform}
                    frontRef={frontRef}
                    backRef={backRef}
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
