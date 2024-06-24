import { EventLog, parseEther } from "ethers";
import { deployments, ethers } from "hardhat";

async function main() {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const nftMarketplaceContract = await deployments.get("NftMarketplace");
    const basicNftContract = await deployments.get("BasicNft");
    const basicNft = await ethers.getContractAt(
        "BasicNft",
        basicNftContract.address,
        deployer
    );
    const nftMarketplace = await ethers.getContractAt(
        "NftMarketplace",
        nftMarketplaceContract.address,
        deployer
    );
    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const eventLog = mintTxReceipt?.logs[0] as EventLog;
    const tokenId = eventLog.args["tokenId"];
    console.log("Approving NFT...");
    const approvalTx = await basicNft.approve(
        await nftMarketplace.getAddress(),
        tokenId
    );
    await approvalTx.wait(1);
    console.log("Listing NFT...");
    const listingTx = await nftMarketplace.listItem(
        await basicNft.getAddress(),
        tokenId,
        parseEther("0.1")
    );
    await listingTx.wait(1);
    console.log("Listed NFT!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
