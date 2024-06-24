import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../hardhat-config-helper";
import { BasicNft } from "../../typechain-types";

const chainId = network.config.chainId!;

!developmentChains.includes(chainId)
    ? describe.skip
    : describe("BasicNft", () => {
          let basicNft: BasicNft;
          let deployer: HardhatEthersSigner;
          let accounts: HardhatEthersSigner[];

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["basicNft"]);
              const basicNftContract = await deployments.get("BasicNft");
              basicNft = await ethers.getContractAt(
                  "BasicNft",
                  basicNftContract.address,
                  deployer
              );
          });
          describe("constructor", () => {
              it("init name,symbol and tokenCounter", async () => {
                  const name = await basicNft.name();
                  const symbol = await basicNft.symbol();
                  const tokenCounter = await basicNft.getTokenCounter();
                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
                  assert.equal(tokenCounter.toString(), "0");
              });
          });
          describe("mintNft", () => {
              it("send nft, emits event and update tokenCounter", async () => {
                  await expect(basicNft.mintNft())
                      .to.emit(basicNft, "DogMinted")
                      .withArgs("0");

                  const tokenCounter = await basicNft.getTokenCounter();
                  const tokenURI = await basicNft.tokenURI(0);
                  const owner = await basicNft.ownerOf("0");
                  assert.equal(owner, deployer.address);
                  assert.equal(tokenCounter.toString(), "1");
                  assert.equal(tokenURI, await basicNft.TOKEN_URI());
              });
          });
      });
