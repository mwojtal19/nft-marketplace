import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat-config-helper";
import verify from "../utils/verify";

const deployNftMarketplace: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = hre.network.config.chainId!;
    const args: any[] = [];
    const nftMarketplace = await hre.deployments.deploy("NftMarketplace", {
        from: deployer.address,
        args: args,
        log: true,
        waitConfirmations: 1,
    });
    if (!developmentChains.includes(chainId) && process.env.ETHERSCAN_API_KEY) {
        await verify(nftMarketplace.address, args);
    }
    hre.deployments.log("---------------------------------");
};
export default deployNftMarketplace;
deployNftMarketplace.tags = ["all", "nftmarketplace"];
