// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

contract SimpleStorage {
    uint256 favNumber;
    Person[] persons;
    mapping(string => uint8) personsMapping;

    struct Person {
        uint8 age;
        string name;
    }

    function store(uint256 _favNumber) public virtual {
        favNumber = _favNumber;
    }

    function retrieve() public view returns (uint256) {
        return favNumber;
    }

    function addPerson(string memory _name, uint8 _age) public {
        persons.push(Person(_age, _name));
        personsMapping[_name] = _age;
    }
}
