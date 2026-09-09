import { useState } from 'react';
import { getEmployeeById } from '../../../api/employeeApi';

/**
 * Custom hook — fetches and manages employee data
 * Returns: { employee, loading, error, fetchEmployee, clearEmployee }
 */
const useEmployee = () => {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEmployee = async (staffId) => {
        if (!staffId || String(staffId).trim() === '') {
            setError('Please enter a valid Staff ID.');
            return;
        }

        setLoading(true);
        setError(null);
        // Don't clear employee yet so card keeps showing previous data while loading

        try {
            const response = await getEmployeeById(staffId.trim());
            if (response.success && response.data) {
                setEmployee(response.data);
            } else {
                setEmployee(null);
                setError('Employee not found. Please check the Staff ID and try again.');
            }
        } catch (err) {
            setEmployee(null);
            setError('Failed to connect to the server. Please check your network connection.');
            console.error('Employee fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearEmployee = () => {
        setEmployee(null);
        setError(null);
    };

    return { employee, loading, error, fetchEmployee, clearEmployee };
};

export default useEmployee;
