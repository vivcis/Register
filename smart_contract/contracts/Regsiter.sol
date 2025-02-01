// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Register {
    struct Student {
        uint id;
        string name;
        uint256 age;
        bool added;
        uint256 confirmed;
    }

    address public user;
    uint256 public nextId;
    mapping(uint256 => bool) private added;
    Student[] public eachStudent;

    constructor() {
        user = msg.sender;
    }

    modifier teacher() {
        require(msg.sender == user, "You are not the teacher");
        _;
    }

    function registerStudent(uint256 id, string memory name, uint256 _age) public teacher {
        require(msg.sender != address(0), "Address zero not allowed");
        eachStudent.push(Student(id, name, _age, true, 0));
        nextId++;
    }

    function studentAdded(uint256 id) public teacher returns (bool) {
        Student storage students = eachStudent[id];
        students.confirmed += 1;
        return added[id] = true;
    }

    function getStudent(uint id) public view returns (string memory, uint) {
        Student storage students = eachStudent[id];
        return (students.name, students.age);
    }

    function removeStudent(uint256 id) public {
        require(bytes(eachStudent[id].name).length > 0, "Student not found");
        delete eachStudent[id];
    }
}