const hre = require("hardhat");

async function main() {

  // ZORUNLU: ganache ağına deploy et
  await hre.run("compile");

  const Contract = await hre.ethers.getContractFactory("CertificateRegistry");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
