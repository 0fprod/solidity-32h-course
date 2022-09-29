import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";
import { ethers } from "hardhat";
import { assert } from "chai";

describe("SimpleStorage", () => {
  let simpleStorageFactory: SimpleStorage__factory;
  let simpleStorage: SimpleStorage;

  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory('SimpleStorage')
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("should start with the favourite number of 0", async () => {
    const favNumber = await simpleStorage.retrieve()
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
