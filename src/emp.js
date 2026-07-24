import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from './api';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFileImport, FaFileExport, FaUsers, FaDollarSign, FaBuilding, FaChartPie } from 'react-icons/fa';

function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [modalForm, setModalForm] = useState({ id: null, name: '', age: '', salary: '', dept: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [file, setFile] = useState(null);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to fetch employees. Please check if the backend is running.');
      toast.error('Failed to fetch employees');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await deleteEmployee(employeeToDelete.id);
        setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
        toast.success(`Employee ${employeeToDelete.name} deleted successfully!`);
        setShowDeleteModal(false);
        setEmployeeToDelete(null);
      } catch (err) {
        toast.error('Failed to delete employee');
        console.error('Delete error:', err);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  const handleEdit = (employee) => {
    setModalMode('edit');
    setModalForm({
      id: employee.id,
      name: employee.name,
      age: employee.age,
      salary: employee.salary,
      dept: employee.dept
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setModalMode('create');
    setModalForm({ id: null, name: '', age: '', salary: '', dept: '' });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  };

  const handleModalSave = async () => {
    try {
      if (modalMode === 'create') {
        const newEmployee = {
          name: modalForm.name,
          age: parseInt(modalForm.age),
          salary: parseInt(modalForm.salary),
          dept: modalForm.dept
        };
        const savedEmployee = await addEmployee(newEmployee);
        setEmployees([...employees, savedEmployee]);
        toast.success(`Employee ${modalForm.name} added successfully!`);
      } else {
        const updatedEmployee = {
          name: modalForm.name,
          age: parseInt(modalForm.age),
          salary: parseInt(modalForm.salary),
          dept: modalForm.dept
        };
        const savedEmployee = await updateEmployee(modalForm.id, updatedEmployee);
        setEmployees(employees.map(emp => 
          emp.id === modalForm.id ? savedEmployee : emp
        ));
        toast.success(`Employee ${modalForm.name} updated successfully!`);
      }
      setShowModal(false);
    } catch (err) {
      toast.error(`Failed to ${modalMode === 'create' ? 'add' : 'update'} employee`);
      console.error('Save error:', err);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEmployees = employees.filter(employee => {
    const query = searchQuery.toLowerCase();
    return (
      employee.id.toString().includes(query) ||
      employee.name.toLowerCase().includes(query) ||
      employee.age.toString().includes(query) ||
      employee.salary.toString().includes(query) ||
      employee.dept.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate which page numbers to show with ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        data.push(obj);
      }
    }
    return data;
  };

  const handleImport = async () => {
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const data = e.target.result;
      let importedEmployees = [];

      if (file.name.endsWith('.csv')) {
        const parsedData = parseCSV(data);
        importedEmployees = parsedData.map((row) => ({
          name: row.name || '',
          age: parseInt(row.age) || 0,
          salary: parseInt(row.salary) || 0,
          dept: row.dept || row.department || ''
        }));
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        importedEmployees = jsonData.map((row) => ({
          name: row.name || row.Name || '',
          age: parseInt(row.age || row.Age) || 0,
          salary: parseInt(row.salary || row.Salary) || 0,
          dept: row.dept || row.department || row.Department || ''
        }));
      }

      try {
        // Import each employee to backend
        const savedEmployees = await Promise.all(
          importedEmployees.map(emp => addEmployee(emp))
        );
        setEmployees([...employees, ...savedEmployees]);
        toast.success(`Successfully imported ${savedEmployees.length} employees`);
      } catch (err) {
        toast.error('Failed to import employees');
        console.error('Import error:', err);
      }
      setFile(null);
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'employees.xlsx');
  };

  // Calculate department distribution
  const departmentData = employees.reduce((acc, emp) => {
    const dept = emp.dept || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(departmentData).map(dept => ({
    name: dept,
    value: departmentData[dept]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Calculate dashboard statistics
  const totalEmployees = employees.length;
  const averageSalary = employees.length > 0 
    ? Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length)
    : 0;
  const highestSalary = employees.length > 0 
    ? Math.max(...employees.map(emp => emp.salary || 0))
    : 0;
  const departmentCount = Object.keys(departmentData).length;

  return (
    <div className="container">

      <h1>Employee Details</h1>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
      {/* Dashboard Summary Cards */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <p className="stat-value">{totalEmployees}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <FaDollarSign />
          </div>
          <div className="stat-content">
            <h3>Average Salary</h3>
            <p className="stat-value">${averageSalary.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <FaDollarSign />
          </div>
          <div className="stat-content">
            <h3>Highest Salary</h3>
            <p className="stat-value">${highestSalary.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <FaBuilding />
          </div>
          <div className="stat-content">
            <h3>Departments</h3>
            <p className="stat-value">{departmentCount}</p>
          </div>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button className="btn-search">
          <FaSearch />
          Search
        </button>
      </div>

      <button className="btn-create" onClick={handleCreate}>
        <FaPlus />
        Add Employee
      </button>

      <div className="import-container">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
        />
        <button className="btn-import" onClick={handleImport} disabled={!file}>
          <FaFileImport />
          Import
        </button>
        <button className="btn-export" onClick={handleExport}>
          <FaFileExport />
          Export
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalMode === 'create' ? 'Add New Employee' : 'Edit Employee'}</h2>
            <div className="modal-form">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={modalForm.name}
                  onChange={handleModalChange}
                />
              </label>
              <label>
                Age:
                <input
                  type="number"
                  name="age"
                  value={modalForm.age}
                  onChange={handleModalChange}
                />
              </label>
              <label>
                Salary:
                <input
                  type="number"
                  name="salary"
                  value={modalForm.salary}
                  onChange={handleModalChange}
                />
              </label>
              <label>
                Department:
                <input
                  type="text"
                  name="dept"
                  value={modalForm.dept}
                  onChange={handleModalChange}
                />
              </label>
            </div>
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleModalSave}>
                <FaSave />
                {modalMode === 'create' ? 'Add' : 'Save'}
              </button>
              <button className="btn-cancel" onClick={handleModalCancel}>
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {employeeToDelete?.name}?</p>
            <div className="modal-buttons">
              <button className="btn-delete" onClick={confirmDelete}>
                <FaTrash />
                Delete
              </button>
              <button className="btn-cancel" onClick={cancelDelete}>
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h2><FaChartPie /> Department Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container">
      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Salary</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {currentEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.age}</td>
              <td>{employee.salary}</td>
              <td>{employee.dept}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(employee)}>
                  <FaEdit />
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(employee)}>
                  <FaTrash />
                  Delete
                </button>
              </td>
            </tr>
          ))}

        </tbody>

      </table>
      </div>

      {filteredEmployees.length > itemsPerPage && (
        <div className="pagination">
          <button 
            className="btn-page" 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  className={`btn-page ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
          
          <button 
            className="btn-page" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default EmployeeTable;