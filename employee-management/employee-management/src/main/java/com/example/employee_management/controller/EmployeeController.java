package com.example.employee_management.controller;

import com.example.employee_management.entity.Employee;
import com.example.employee_management.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping({"", "/"})
    public List<Employee> getEmployees() {
        return service.getAll();
    }

    @PostMapping({"", "/"})
    public Employee addEmployee(@Valid @RequestBody Employee employee) {
        return service.save(employee);
    }

    @PostMapping("/bulk")
    public List<Employee> addEmployees(@Valid @RequestBody List<Employee> employees) {
        return service.saveAll(employees);
    }

    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        return service.update(id, employee);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id) {
        service.delete(id);
    }
}