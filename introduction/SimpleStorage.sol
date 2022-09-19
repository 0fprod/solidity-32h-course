// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

contract SimpleStorage {
    // initializes to 0
    uint256 favNumber; // private by default
    Person[] persons; // Dynamic array *expensive*
    mapping(string => uint8) personsDictionary;

    struct Person {
        uint8 age;
        string name;
    }

    function store(uint256 _favNumber) public virtual {
        favNumber = _favNumber;
    }

    // views and pure functions does not cost gas, unless you call these functions from
    // another function that actually consumes gas
    function getFavNumber() public view returns (uint256) {
        return favNumber;
    }

    // function add(uint256 _a, uint256 _b) public pure returns (uint256) {
    //     return _a + _b;
    // }

    function addPerson(string memory _name, uint8 _age) public {
        // Person memory newPerson = Person({age: _age, name: _name});
        // Person memory newPerson = Person(_age, _name); // same order as defined in the struct
        // persons.push(newPerson);
        persons.push(Person(_age, _name));
        personsDictionary[_name] = _age;
    }

    function getPerson(uint8 index) public view returns (Person memory) {
        return persons[index];
    }

    function getPersonsAgeByName(string memory _name)
        public
        view
        returns (uint8)
    {
        return personsDictionary[_name];
    }

    /** ## TypeError ##
    Data location must be "memory" or "calldata" for parameter in function, but none was given. 
      Calldata & Memory means that the variable will only exist temporarily.
      Memory can be modified in the function
      Calldata cannot be modified in the function
      Storage variables exists outside the scope of the current function
    */
}
