package com.example.employee_management.service;

import com.example.employee_management.dto.ChatRequest;
import com.example.employee_management.dto.ChatResponse;
import com.example.employee_management.entity.Employee;
import com.example.employee_management.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final EmployeeRepository employeeRepository;

    public ChatService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public ChatResponse processMessage(ChatRequest request) {
        String message = request.getMessage();
        String response = generateResponse(message);
        return new ChatResponse(response);
    }

    private String generateResponse(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Please provide a message.";
        }

        String lowerMessage = message.toLowerCase();

        // Employee count
        if (lowerMessage.contains("how many") && lowerMessage.contains("employee")) {
            long count = employeeRepository.count();
            return "There are currently " + count + " employees in the company.";
        }

        // Average salary
        if (lowerMessage.contains("average") && lowerMessage.contains("salary")) {
            List<Employee> employees = employeeRepository.findAll();
            if (employees.isEmpty()) {
                return "There are no employees to calculate average salary.";
            }
            double average = employees.stream()
                    .mapToDouble(Employee::getSalary)
                    .average()
                    .orElse(0);
            return "The average salary is $" + String.format("%.2f", average);
        }

        // Highest salary
        if (lowerMessage.contains("highest") && lowerMessage.contains("salary")) {
            List<Employee> employees = employeeRepository.findTopBySalaryDesc();
            if (employees.isEmpty()) {
                return "There are no employees to find the highest salary.";
            }
            Employee topEarner = employees.get(0);
            return "The highest salary is $" + topEarner.getSalary() + " earned by " + topEarner.getName();
        }

        // Lowest salary
        if (lowerMessage.contains("lowest") && lowerMessage.contains("salary")) {
            List<Employee> employees = employeeRepository.findTopBySalaryAsc();
            if (employees.isEmpty()) {
                return "There are no employees to find the lowest salary.";
            }
            Employee lowestEarner = employees.get(0);
            return "The lowest salary is $" + lowestEarner.getSalary() + " earned by " + lowestEarner.getName();
        }

        // Youngest employee
        if (lowerMessage.contains("youngest") && lowerMessage.contains("employee")) {
            List<Employee> employees = employeeRepository.findTopByAgeAsc();
            if (employees.isEmpty()) {
                return "There are no employees to find the youngest.";
            }
            Employee youngest = employees.get(0);
            return "The youngest employee is " + youngest.getName() + " who is " + youngest.getAge() + " years old.";
        }

        // Oldest employee
        if (lowerMessage.contains("oldest") && lowerMessage.contains("employee")) {
            List<Employee> employees = employeeRepository.findTopByAgeDesc();
            if (employees.isEmpty()) {
                return "There are no employees to find the oldest.";
            }
            Employee oldest = employees.get(0);
            return "The oldest employee is " + oldest.getName() + " who is " + oldest.getAge() + " years old.";
        }

        // IT employees
        if (lowerMessage.contains("it") && lowerMessage.contains("employee")) {
            List<Employee> itEmployees = employeeRepository.findByDepartment("IT");
            if (itEmployees.isEmpty()) {
                return "There are no IT employees.";
            }
            StringBuilder response = new StringBuilder("IT Employees:\n");
            for (Employee emp : itEmployees) {
                response.append("- ").append(emp.getName()).append(" (Age: ").append(emp.getAge())
                        .append(", Salary: $").append(emp.getSalary()).append(")\n");
            }
            return response.toString();
        }

        // HR employees
        if (lowerMessage.contains("hr") && lowerMessage.contains("employee")) {
            List<Employee> hrEmployees = employeeRepository.findByDepartment("HR");
            if (hrEmployees.isEmpty()) {
                return "There are no HR employees.";
            }
            StringBuilder response = new StringBuilder("HR Employees:\n");
            for (Employee emp : hrEmployees) {
                response.append("- ").append(emp.getName()).append(" (Age: ").append(emp.getAge())
                        .append(", Salary: $").append(emp.getSalary()).append(")\n");
            }
            return response.toString();
        }

        // Employee statistics
        if (lowerMessage.contains("statistics") || lowerMessage.contains("stats")) {
            List<Employee> employees = employeeRepository.findAll();
            if (employees.isEmpty()) {
                return "There are no employees to show statistics.";
            }
            long count = employees.size();
            double avgSalary = employees.stream().mapToDouble(Employee::getSalary).average().orElse(0);
            double maxSalary = employees.stream().mapToDouble(Employee::getSalary).max().orElse(0);
            double minSalary = employees.stream().mapToDouble(Employee::getSalary).min().orElse(0);
            double avgAge = employees.stream().mapToInt(Employee::getAge).average().orElse(0);

            return String.format(
                    "Employee Statistics:\n" +
                    "- Total Employees: %d\n" +
                    "- Average Salary: $%.2f\n" +
                    "- Highest Salary: $%.2f\n" +
                    "- Lowest Salary: $%.2f\n" +
                    "- Average Age: %.1f years",
                    count, avgSalary, maxSalary, minSalary, avgAge
            );
        }

        // Find employee by ID
        if (lowerMessage.contains("find") && lowerMessage.contains("id")) {
            String[] words = message.split("\\s+");
            for (String word : words) {
                try {
                    Long id = Long.parseLong(word);
                    Optional<Employee> employee = employeeRepository.findById(id);
                    if (employee.isPresent()) {
                        Employee emp = employee.get();
                        return "Employee Found:\n" +
                                "- ID: " + emp.getId() + "\n" +
                                "- Name: " + emp.getName() + "\n" +
                                "- Age: " + emp.getAge() + "\n" +
                                "- Department: " + emp.getDepartment() + "\n" +
                                "- Salary: $" + emp.getSalary();
                    } else {
                        return "No employee found with ID: " + id;
                    }
                } catch (NumberFormatException e) {
                    // Continue to next word
                }
            }
            return "Please provide a valid employee ID.";
        }

        // Find employee by name
        if (lowerMessage.contains("find") && lowerMessage.contains("name")) {
            String[] words = message.split("\\s+");
            for (int i = 0; i < words.length; i++) {
                if (words[i].equalsIgnoreCase("name") && i + 1 < words.length) {
                    String name = message.substring(message.indexOf("name") + 5).trim();
                    Optional<Employee> employee = employeeRepository.findByName(name);
                    if (employee.isPresent()) {
                        Employee emp = employee.get();
                        return "Employee Found:\n" +
                                "- ID: " + emp.getId() + "\n" +
                                "- Name: " + emp.getName() + "\n" +
                                "- Age: " + emp.getAge() + "\n" +
                                "- Department: " + emp.getDepartment() + "\n" +
                                "- Salary: $" + emp.getSalary();
                    } else {
                        return "No employee found with name: " + name;
                    }
                }
            }
            return "Please provide a valid employee name.";
        }

        // Greetings
        if (lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "Hello! I can help you with employee information. Ask me about employee count, salaries, departments, or find specific employees!";
        } else if (lowerMessage.contains("how are you")) {
            return "I'm doing great, thank you for asking!";
        } else if (lowerMessage.contains("bye") || lowerMessage.contains("goodbye")) {
            return "Goodbye! Have a great day!";
        } else if (lowerMessage.contains("help")) {
            return "I can help you with:\n" +
                    "- Employee count\n" +
                    "- Salary statistics (average, highest, lowest)\n" +
                    "- Age queries (youngest, oldest)\n" +
                    "- Department queries (IT, HR)\n" +
                    "- Employee statistics\n" +
                    "- Find employee by ID or name";
        } else {
            return "I'm not sure how to help with that. Try asking about employee statistics, salaries, or departments!";
        }
    }
}
