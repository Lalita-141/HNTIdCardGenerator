import { fetchApi } from './fetchApi';

// In development, Vite proxy forwards /employee-app → http://172.20.1.56:8080
// In production, set this to the full URL: http://172.20.1.56:8080/employee-app/api
const BASE_URL = 'http://172.20.1.56:8080/employee-app/api';
const dev_BaseUrl = 'http://172.20.1.192:8082/employee-app/api';

/**
 * Fetches employee details by staff ID
 * @param {number|string} staffId - The employee's staff ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const getEmployeeById = (staffId) => {
    return fetchApi('GET', `${dev_BaseUrl}/employee/${staffId}`, null, false, null, false);
};
