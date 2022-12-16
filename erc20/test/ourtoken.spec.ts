import { ethers, network, deployments, getNamedAccounts } from "hardhat";
import { expect } from "chai";
import { INITIAL_SUPPLY, isDevelopmentChain } from "../helper-hardhat.config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { OurToken } from "../typechain-types";

if (isDevelopmentChain(network.config.chainId)) {
  describe("OurToken ", () => {
    let ourToken: OurToken;
    const oneEther = ethers.utils.parseEther("1");
    let deployer, user: any;

    beforeEach(async () => {
      const { deployer: d, user: u } = await getNamedAccounts();
      deployer = d;
      user = u;
      await deployments.fixture("all");

      const ourTokenDeployment = await deployments.get("OurToken");
      ourToken = await ethers.getContractAt(
        "OurToken",
        ourTokenDeployment.address
      );
    });

    it("initializes correctly", async () => {
      const totalSupply = await ourToken.totalSupply();
      const name = await ourToken.name();
      const symbol = await ourToken.symbol();

      expect(totalSupply).to.eq(INITIAL_SUPPLY);
      expect(name.toString()).to.eq("OurToken");
      expect(symbol.toString()).to.eq("OT");
    });

    it("allow transfers to users", async () => {
      const initialBalance = await ourToken.balanceOf(user);
      const expectedAmount = oneEther.add(initialBalance);

      await ourToken.transfer(user, oneEther);

      const newBalance = await ourToken.balanceOf(user);
      expect(newBalance).to.eq(expectedAmount);
    });

    it("emits an event when a transfer occurs", async () => {
      await expect(ourToken.transfer(user, oneEther)).to.emit(
        ourToken,
        "Transfer"
      );
    });
  });
}
