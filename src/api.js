import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/employees';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all employees
export const getEmployees = async () => {
  try {
    const response = await api.get('/');
    // Map backend 'department' to frontend 'dept'
    return response.data.map(emp => ({
      ...emp,
      dept: emp.department
    }));
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Add a new employee
export const addEmployee = async (employee) => {
  try {
    // Map frontend 'dept' to backend 'department'
    const backendEmployee = {
      ...employee,
      department: employee.dept
    };
    delete backendEmployee.dept;
    
    const response = await api.post('/', backendEmployee);
    // Map backend 'department' to frontend 'dept'
    return {
      ...response.data,
      dept: response.data.department
    };
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

// Update an existing employee
export const updateEmployee = async (id, employee) => {
  try {
    // Map frontend 'dept' to backend 'department'
    const backendEmployee = {
      ...employee,
      department: employee.dept
    };
    delete backendEmployee.dept;
    
    const response = await api.put(`/${id}`, backendEmployee);
    // Map backend 'department' to frontend 'dept'
    return {
      ...response.data,
      dept: response.data.department
    };
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

// Delete an employee
export const deleteEmployee = async (id) => {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

// Send chat message to AI assistant
export const sendChatMessage = async (message) => {
  try {
    const response = await axios.post('http://localhost:8080/api/chat', {
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export default api;
