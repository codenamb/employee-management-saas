package com.example.employee_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.employee_management.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByName(String name);

    List<Employee> findByDepartment(String department);

    @Query("SELECT e FROM Employee e ORDER BY e.salary DESC")
    List<Employee> findTopBySalaryDesc();

    @Query("SELECT e FROM Employee e ORDER BY e.salary ASC")
    List<Employee> findTopBySalaryAsc();

    @Query("SELECT e FROM Employee e ORDER BY e.age ASC")
    List<Employee> findTopByAgeAsc();

    @Query("SELECT e FROM Employee e ORDER BY e.age DESC")
    List<Employee> findTopByAgeDesc();
}