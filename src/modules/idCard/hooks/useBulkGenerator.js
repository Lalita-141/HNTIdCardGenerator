import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { DEFAULT_EMPLOYEES } from '../../../data/defaultEmployees';
import { getEmployeeById } from '../../../api/employeeApi';
import { formatProfileImage } from '../../../utils/imageUtils';
import { removeBgAndFramePassport } from '../../../utils/photoProcessor';
import {
    renderCardCanvas,
    createCombinedCardCanvas,
    createIdCardsPdf,
    addEmployeeToPdf,
    triggerDownload,
} from '../../../utils/cardRenderer';

/**
 * Helper to ensure React has flushed DOM updates and the employee photo is loaded.
 */
function waitForCardRender(frontElement) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!frontElement) {
                resolve();
                return;
            }
            const img = frontElement.querySelector('.idc__photo-img');
            if (!img) {
                setTimeout(resolve, 80);
                return;
            }
            if (img.complete && img.naturalWidth > 0) {
                setTimeout(resolve, 80);
            } else {
                let resolved = false;
                const done = () => {
                    if (!resolved) {
                        resolved = true;
                        setTimeout(resolve, 80);
                    }
                };
                img.onload = done;
                img.onerror = done;
                setTimeout(done, 1200);
            }
        }, 70);
    });
}

export function useBulkGenerator(onPreviewEmployee) {
    const [employees, setEmployees] = useState(() =>
        DEFAULT_EMPLOYEES.map((emp) => ({
            ...emp,
            selected: true,
            status: 'idle', // 'idle' | 'processing' | 'done' | 'error'
        }))
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationComplete, setGenerationComplete] = useState(false);
    const [progress, setProgress] = useState({
        current: 0,
        total: 0,
        percent: 0,
        currentName: '',
        currentCode: '',
        stepText: '',
    });
    const [exportFormat, setExportFormat] = useState('jpg'); // 'jpg' | 'png'
    const [pageSize, setPageSize] = useState('cr80'); // 'cr80' | 'a4'
    const [bgMode, setBgMode] = useState('green'); // 'green' (template background) | 'original'
    const [cardLayout, setCardLayout] = useState('front_only'); // 'front_only' (default) | 'combined' | 'separate'
    const [generatedZipBlob, setGeneratedZipBlob] = useState(null);
    const [generatedPdf, setGeneratedPdf] = useState(null);

    const isCancelledRef = useRef(false);
    const employeeCache = useRef(new Map());

    // Filter employees based on search query
    const filteredEmployees = employees.filter((emp) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return emp.code.toLowerCase().includes(q) || emp.name.toLowerCase().includes(q);
    });

    const selectedCount = employees.filter((e) => e.selected).length;
    const isAllSelected = employees.length > 0 && selectedCount === employees.length;

    // Toggle single employee selection
    const toggleEmployee = useCallback((code) => {
        setEmployees((prev) =>
            prev.map((e) => (e.code === code ? { ...e, selected: !e.selected } : e))
        );
    }, []);

    // Check all employees
    const selectAll = useCallback(() => {
        setEmployees((prev) => prev.map((e) => ({ ...e, selected: true })));
    }, []);

    // Uncheck all employees
    const unselectAll = useCallback(() => {
        setEmployees((prev) => prev.map((e) => ({ ...e, selected: false })));
    }, []);

    // Invert current selection
    const invertSelection = useCallback(() => {
        setEmployees((prev) => prev.map((e) => ({ ...e, selected: !e.selected })));
    }, []);

    // Select only filtered employees
    const selectFilteredOnly = useCallback(() => {
        const filteredCodes = new Set(filteredEmployees.map((e) => e.code));
        setEmployees((prev) =>
            prev.map((e) => ({
                ...e,
                selected: filteredCodes.has(e.code),
            }))
        );
    }, [filteredEmployees]);

    // Update status of a specific employee
    const updateEmployeeStatus = (code, status) => {
        setEmployees((prev) =>
            prev.map((e) => (e.code === code ? { ...e, status } : e))
        );
    };

    // Cancel active generation
    const stopBulkGeneration = useCallback(() => {
        isCancelledRef.current = true;
        setIsGenerating(false);
    }, []);

    // Run bulk generation (Front Card Only in ZIP)
    const startBulkGeneration = useCallback(
        async ({ frontRef }) => {
            if (!frontRef?.current) {
                alert('Card preview is not ready. Please try again.');
                return;
            }

            const targetEmployees = employees.filter((e) => e.selected);
            if (targetEmployees.length === 0) {
                alert('Please select at least one employee to generate ID cards.');
                return;
            }

            setIsGenerating(true);
            setGenerationComplete(false);
            setGeneratedZipBlob(null);
            setGeneratedPdf(null);
            isCancelledRef.current = false;

            // Reset statuses to idle for selected ones
            setEmployees((prev) =>
                prev.map((e) => (e.selected ? { ...e, status: 'idle' } : e))
            );

            // Initialize ZIP archive for Front JPG cards
            const zip = new JSZip();
            const isJpg = exportFormat === 'jpg';
            const ext = isJpg ? 'jpg' : 'png';

            let completedCount = 0;

            for (let i = 0; i < targetEmployees.length; i++) {
                if (isCancelledRef.current) break;

                const empItem = targetEmployees[i];

                updateEmployeeStatus(empItem.code, 'processing');
                setProgress({
                    current: i + 1,
                    total: targetEmployees.length,
                    percent: Math.round(((i + 1) / targetEmployees.length) * 100),
                    currentName: empItem.name,
                    currentCode: empItem.code,
                    stepText: 'Fetching details & photo...',
                });

                // Fetch employee data (cached if available)
                let empData = employeeCache.current.get(empItem.code);
                if (!empData) {
                    try {
                        const res = await getEmployeeById(empItem.code);
                        if (res.success && res.data) {
                            empData = res.data;
                        } else {
                            empData = {
                                staffId: empItem.code,
                                firstName: empItem.name,
                                lastName: '',
                                bloodGroup: '',
                            };
                        }
                    } catch (err) {
                        console.warn(`API fetch failed for ${empItem.code}, using fallback:`, err);
                        empData = {
                            staffId: empItem.code,
                            firstName: empItem.name,
                            lastName: '',
                            bloodGroup: '',
                        };
                    }
                    employeeCache.current.set(empItem.code, empData);
                }

                // 2. Remove background to apply the exact template green background
                const rawPhoto = formatProfileImage(empData?.profilePicture);
                let processed = null;

                if (bgMode === 'green' && rawPhoto) {
                    setProgress((prev) => ({
                        ...prev,
                        stepText: 'Applying template green photo background...',
                    }));
                    try {
                        processed = await removeBgAndFramePassport(rawPhoto);
                    } catch (bgErr) {
                        console.warn(`Background removal failed for ${empItem.name}:`, bgErr);
                    }
                }

                // 3. Update preview panel with employee data AND processed cutout photo
                if (onPreviewEmployee) {
                    onPreviewEmployee(empData, processed);
                }

                setProgress((prev) => ({
                    ...prev,
                    stepText: 'Rendering high-resolution Front JPG card...',
                }));

                // Wait for DOM to update and photo to load
                await waitForCardRender(frontRef.current);

                // Check again if cancelled during wait
                if (isCancelledRef.current) break;

                // 4. Render Front card ONLY with the template green background
                try {
                    const frontCurved = await renderCardCanvas(frontRef.current, 2.5, isJpg);
                    const frontDataUrl = frontCurved.toDataURL(isJpg ? 'image/jpeg' : 'image/png', 0.98);

                    const fullName = [empData.firstName, empData.lastName].filter(Boolean).join(' ') || empItem.name;
                    const cleanSlug = `${fullName}_${empData.staffId || empItem.code}`.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');

                    // Save ONLY Front ID Card into ZIP
                    zip.file(`IDCard_${cleanSlug}_Front.${ext}`, frontDataUrl.split(',')[1], { base64: true });

                    updateEmployeeStatus(empItem.code, 'done');
                    completedCount++;
                } catch (err) {
                    console.error(`Card generation failed for ${empItem.name}:`, err);
                    updateEmployeeStatus(empItem.code, 'error');
                }
            }

            if (completedCount > 0 && !isCancelledRef.current) {
                // Auto-download the ZIP archive containing ONLY Front JPG images
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                setGeneratedZipBlob(zipBlob);

                const zipName =
                    targetEmployees.length === DEFAULT_EMPLOYEES.length
                        ? 'All_Employees_Front_ID_Cards_JPG.zip'
                        : `Selected_Employees_Front_ID_Cards_${completedCount}_JPG.zip`;

                const zipUrl = URL.createObjectURL(zipBlob);
                triggerDownload(zipUrl, zipName);
                setTimeout(() => URL.revokeObjectURL(zipUrl), 10000);

                setGenerationComplete(true);
            }

            setIsGenerating(false);
        },
        [employees, exportFormat, bgMode, onPreviewEmployee]
    );

    const downloadZipAgain = useCallback(() => {
        if (!generatedZipBlob) return;
        const url = URL.createObjectURL(generatedZipBlob);
        const count = employees.filter((e) => e.status === 'done').length;
        triggerDownload(url, `Employee_Front_ID_Cards_JPG_${count}.zip`);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, [generatedZipBlob, employees]);

    const downloadPdfOptional = useCallback(() => {
        if (!generatedPdf) return;
        const count = employees.filter((e) => e.status === 'done').length;
        generatedPdf.save(`Employee_ID_Cards_${count}.pdf`);
    }, [generatedPdf, employees]);

    return {
        employees,
        filteredEmployees,
        searchQuery,
        setSearchQuery,
        selectedCount,
        isAllSelected,
        isGenerating,
        generationComplete,
        progress,
        exportFormat,
        setExportFormat,
        pageSize,
        setPageSize,
        bgMode,
        setBgMode,
        cardLayout,
        setCardLayout,
        generatedZipBlob,
        generatedPdf,
        toggleEmployee,
        selectAll,
        unselectAll,
        invertSelection,
        selectFilteredOnly,
        startBulkGeneration,
        stopBulkGeneration,
        downloadZipAgain,
        downloadPdfOptional,
        employeeCache,
    };
}

export default useBulkGenerator;
