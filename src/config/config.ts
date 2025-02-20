import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/exchange-aggregator",
  pollingInterval: Number(process.env.POLLING_INTERVAL) || 10000,
  proxyUrl: process.env.PROXY_URL || "",
  infuraKey: process.env.INFURA_KEY || "",
  supportedCEXPairs: {
    BTC: "BTC/USDT",
    ETH: "ETH/USDT",
    SOL: "SOL/USDT",
  },
  supportedDEXPairs: {
    ethereum: {
      ETH: {
        address: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
        baseToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        needsEthConversion: false,
      },
      SOL: {
        address: "0x127452F3f9cDc0389b0Bf59ce6131aA3Bd763598",
        baseToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        needsEthConversion: true,
      },
      BTC: {
        address: "0x99ac8cA7087fA4A2A1FB6357269965A2014ABc35",
        baseToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        needsEthConversion: false,
      },
    },
    solana: {
      ETH: {
        address: "4yrHms7ekgTBgJg77zJ33TsWrraqHsCXDtuSZqUsuGHb",
        baseToken: "So11111111111111111111111111111111111111112",
        needsSolConversion: true,
      },
      SOL: {
        address: "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF",
        baseToken: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        needsSolConversion: false,
      },
      BTC: {
        address: "HCfytQ49w6Dn9UhHCqjNYTZYQ6z5SwqmsyYYqW4EKDdA",
        baseToken: "So11111111111111111111111111111111111111112",
        needsSolConversion: true,
      },
    },
  },
};
