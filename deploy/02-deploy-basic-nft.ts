import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat-config-helper";

const deployBasicNft: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = hre.network.config.chainId!;
    if (developmentChains.includes(chainId)) {
        const args: any[] = [];
        await hre.deployments.deploy("BasicNft", {
            from: deployer.address,
            args: args,
            log: true,
            waitConfirmations: 1,
        });
        hre.deployments.log("---------------------------------");
    }
};
export default deployBasicNft;
deployBasicNft.tags = ["all", "basicNft"];
