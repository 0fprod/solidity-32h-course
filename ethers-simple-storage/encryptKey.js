const ethers = require("ethers");
const fs = require("fs-extra");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const encryptedJsonKey = await wallet.encrypt(process.env.PW);
  fs.writeFileSync("./encryptedkey.json", encryptedJsonKey);
}

main();
