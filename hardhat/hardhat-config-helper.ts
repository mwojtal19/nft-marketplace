interface NetworkConfig {
    [key: number]: {
        name: string;
        ethUsdPriceFeed?: string;
    };
}

export const networkConfig: NetworkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    31337: {
        name: "hardhat",
    },
};

export const developmentChains = [31337];
