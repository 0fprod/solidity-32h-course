/**
 * Testing is also possible with Solidity.
 * The developers that say this agree on that the test should be as close
 * as possible to the code.
 *
 * But testing with a modern programming language like js gives you more
 * flexibility to do more stuffs to interact and tests your smart contracts
 */
const { ethers } = require("hardhat");
const { assert, expect } = require("chai");
describe("SimpleStorage", () => {
  let simpleStorageFactory;
  let simpleStorage;

  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("should start with the favourite number of 0", async () => {
    const favNumber = await simpleStorage.retrieve();
    const expectedValue = "0";
    assert.equal(favNumber.toString(), expectedValue);
  });

  it("should update the favNumber", async () => {
    await simpleStorage.store("37");
    const favNumber = await simpleStorage.retrieve();
    const expectedValue = "37";
    assert.equal(favNumber.toString(), expectedValue);
  });
});
