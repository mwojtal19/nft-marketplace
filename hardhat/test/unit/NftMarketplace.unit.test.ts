import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { parseEther, ZeroAddress } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { Deployment } from "hardhat-deploy/dist/types";
import { developmentChains } from "../../hardhat-config-helper";
import { BasicNft, NftMarketplace } from "../../typechain-types";

const chainId = network.config.chainId!;

!developmentChains.includes(chainId)
    ? describe.skip
    : describe("NftMarketplace", () => {
          const PRICE = parseEther("0.1");
          const TOKEN_ID = 0;
          let nftMarketplace: NftMarketplace;
          let nftMarketplaceContract: Deployment;
          let basicNft: BasicNft;
          let deployer: HardhatEthersSigner;
          let accounts: HardhatEthersSigner[];
          let user: HardhatEthersSigner;
          let nftAddress: string;
          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              user = accounts[1];
              await deployments.fixture(["all"]);
              nftMarketplaceContract = await deployments.get("NftMarketplace");
              const basicNftContract = await deployments.get("BasicNft");
              nftMarketplace = await ethers.getContractAt(
                  "NftMarketplace",
                  nftMarketplaceContract.address,
                  deployer
              );
              basicNft = await ethers.getContractAt(
                  "BasicNft",
                  basicNftContract.address,
                  deployer
              );
              nftAddress = await basicNft.getAddress();
              await basicNft.mintNft();
              await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
          });

          describe("listItem", () => {
              it("reverts when not owner", async () => {
                  const userNftMarketplace = nftMarketplace.connect(user);
                  await expect(
                      userNftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(
                      userNftMarketplace,
                      "NftMarketplace__NotOwner"
                  );
              });
              it("reverts when already listed", async () => {
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  await expect(
                      nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE)
                  )
                      .to.be.revertedWithCustomError(
                          nftMarketplace,
                          "NftMarketplace__AlreadyListed"
                      )
                      .withArgs(nftAddress, TOKEN_ID);
              });
              it("reverts when price is negative", async () => {
                  await expect(
                      nftMarketplace.listItem(nftAddress, TOKEN_ID, "0")
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__PriceMustBeAboveZero"
                  );
              });
              it("reverts when nft not approved", async () => {
                  await basicNft.approve(ZeroAddress, TOKEN_ID);
                  await expect(
                      nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE)
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__NotApprovedForMarketplace"
                  );
              });
              it("emits event", async () => {
                  await expect(
                      nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE)
                  )
                      .to.emit(nftMarketplace, "ItemListed")
                      .withArgs(deployer.address, nftAddress, TOKEN_ID, PRICE);
              });
              it("updates listings", async () => {
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  const listing = await nftMarketplace.getListing(
                      nftAddress,
                      TOKEN_ID
                  );
                  assert.equal(listing.price.toString(), PRICE.toString());
                  assert.equal(listing.seller.toString(), deployer.address);
              });
          });
          describe("buyItem", async () => {
              it("reverts when not listed", async () => {
                  await expect(nftMarketplace.buyItem(nftAddress, TOKEN_ID))
                      .to.be.revertedWithCustomError(
                          nftMarketplace,
                          "NftMarketplace__NotListed"
                      )
                      .withArgs(nftAddress, TOKEN_ID);
              });
              it("reverts when price not met", async () => {
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  await expect(nftMarketplace.buyItem(nftAddress, TOKEN_ID))
                      .to.be.revertedWithCustomError(
                          nftMarketplace,
                          "NftMarketplace__PriceNotMet"
                      )
                      .withArgs(nftAddress, TOKEN_ID, PRICE);
              });
              it("updates proceeds,emit event, update listings and transfer nft", async () => {
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  const userNftMarketplace = nftMarketplace.connect(user);
                  await expect(
                      userNftMarketplace.buyItem(nftAddress, TOKEN_ID, {
                          value: PRICE,
                      })
                  )
                      .to.emit(nftMarketplace, "ItemBought")
                      .withArgs(user.address, nftAddress, TOKEN_ID, PRICE);

                  const listing = await nftMarketplace.getListing(
                      nftAddress,
                      TOKEN_ID
                  );
                  const proceed = await nftMarketplace.getProceeds(
                      deployer.address
                  );
                  assert.equal(proceed, PRICE);
                  assert.equal(listing.price.toString(), "0");
                  assert.equal(listing.seller, ZeroAddress);
                  assert.equal(await basicNft.ownerOf(TOKEN_ID), user.address);
              });
          });
          describe("cancelListing", () => {
              it("reverts when not owner", async () => {
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  const userNftMarketplace = nftMarketplace.connect(user);
                  await expect(
                      userNftMarketplace.cancelListing(nftAddress, TOKEN_ID)
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__NotOwner"
                  );
              });
              it("reverts when is not listed", async () => {
                  await expect(
                      nftMarketplace.cancelListing(nftAddress, TOKEN_ID)
                  )
                      .to.be.revertedWithCustomError(
                          nftMarketplace,
                          "NftMarketplace__NotListed"
                      )
                      .withArgs(nftAddress, TOKEN_ID);
              });
              it("cancel listing and emit event", async () => {
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  await expect(
                      nftMarketplace.cancelListing(nftAddress, TOKEN_ID)
                  )
                      .to.emit(nftMarketplace, "ItemCanceled")
                      .withArgs(deployer.address, nftAddress, TOKEN_ID);
                  const listing = await nftMarketplace.getListing(
                      nftAddress,
                      TOKEN_ID
                  );
                  assert.equal(listing.price.toString(), "0");
                  assert.equal(listing.seller, ZeroAddress);
              });
          });
          describe("updateListing", () => {
              it("reverts when not listed", async () => {
                  await expect(
                      nftMarketplace.updateListing(nftAddress, TOKEN_ID, PRICE)
                  )
                      .to.be.revertedWithCustomError(
                          nftMarketplace,
                          "NftMarketplace__NotListed"
                      )
                      .withArgs(nftAddress, TOKEN_ID);
              });
              it("reverts when not owner", async () => {
                  const userNftMarketplace = nftMarketplace.connect(user);
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  await expect(
                      userNftMarketplace.updateListing(
                          nftAddress,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__NotOwner"
                  );
              });
              it("updates listing and emits event", async () => {
                  const newPrice = parseEther("2");
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  await expect(
                      nftMarketplace.updateListing(
                          nftAddress,
                          TOKEN_ID,
                          newPrice
                      )
                  )
                      .to.emit(nftMarketplace, "ItemListed")
                      .withArgs(
                          deployer.address,
                          nftAddress,
                          TOKEN_ID,
                          newPrice
                      );
              });
          });
          describe("withdrawProceeds", () => {
              it("reverts when no proceeds available", async () => {
                  await expect(
                      nftMarketplace.withdrawProceeds()
                  ).to.be.revertedWithCustomError(
                      nftMarketplace,
                      "NftMarketplace__NoProceeds"
                  );
              });
              it("updates and send proceeds", async () => {
                  const userNftMarketplace = nftMarketplace.connect(user);
                  await nftMarketplace.listItem(nftAddress, TOKEN_ID, PRICE);
                  await userNftMarketplace.buyItem(nftAddress, TOKEN_ID, {
                      value: PRICE,
                  });
                  const deployerProceedsBefore =
                      await nftMarketplace.getProceeds(deployer.address);
                  const deployerBalanceBefore =
                      await ethers.provider.getBalance(deployer.address);
                  const txResponse = await nftMarketplace.withdrawProceeds();
                  const txReceipt = await txResponse.wait(1);
                  const deployerProceedsAfter =
                      await nftMarketplace.getProceeds(deployer.address);
                  const deployerBalanceAfter = await ethers.provider.getBalance(
                      deployer.address
                  );
                  const gasCost = txReceipt?.gasUsed! * txReceipt?.gasPrice!;
                  assert.equal(deployerProceedsAfter.toString(), "0");
                  assert.equal(
                      deployerProceedsBefore.toString(),
                      PRICE.toString()
                  );
                  assert.equal(
                      deployerBalanceAfter + gasCost,
                      deployerBalanceBefore + deployerProceedsBefore
                  );
              });
          });
      });
