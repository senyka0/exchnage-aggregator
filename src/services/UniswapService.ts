import { ethers } from "ethers";
import { config } from "../config/config";
import { Price } from "../models/Price";

export class UniswapService {
  private provider: ethers.WebSocketProvider | undefined;
  private pairContracts: Map<string, ethers.Contract>;
  private readonly INFURA_WSS: string;
  private readonly POOLS = config.supportedDEXPairs.ethereum;
  private readonly TOKEN_ABI = [
    "function decimals() external view returns (uint8)",
  ];
  private readonly PAIR_ABI = [
    "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
  ];

  constructor() {
    this.INFURA_WSS = `wss://mainnet.infura.io/ws/v3/${config.infuraKey}`;
    this.pairContracts = new Map();
  }

  public setupWebSocket() {
    try {
      this.provider = new ethers.WebSocketProvider(this.INFURA_WSS, "mainnet");
      this.setupPairContracts();
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }

  private async setupPairContracts() {
    for (const [symbol, poolInfo] of Object.entries(this.POOLS)) {
      const contract = new ethers.Contract(
        poolInfo.address,
        this.PAIR_ABI,
        this.provider
      );

      const token0 = await contract.token0();
      const token1 = await contract.token1();

      const isBaseToken0 =
        token0.toLowerCase() === poolInfo.baseToken.toLowerCase();

      const token0Contract = new ethers.Contract(
        token0,
        this.TOKEN_ABI,
        this.provider
      );
      const token1Contract = new ethers.Contract(
        token1,
        this.TOKEN_ABI,
        this.provider
      );

      const token0Decimals = await token0Contract.decimals();
      const token1Decimals = await token1Contract.decimals();

      const decimalAdjustment = Math.abs(token1Decimals - token0Decimals);

      this.pairContracts.set(symbol, contract);
      this.listenToPriceUpdates(
        symbol,
        contract,
        isBaseToken0,
        poolInfo.needsEthConversion,
        decimalAdjustment
      );
    }
  }

  private async listenToPriceUpdates(
    symbol: string,
    contract: ethers.Contract,
    isBaseToken0: boolean,
    needsEthConversion: boolean,
    decimalAdjustment: number
  ) {
    contract.on(
      "Swap",
      async (
        sender: string,
        recipient: string,
        amount0: bigint,
        amount1: bigint,
        sqrtPriceX96: bigint,
        liquidity: bigint,
        tick: number
      ) => {
        let price = Math.pow(1.0001, Number(tick));
        if (isBaseToken0) {
          price = 1 / price;
        }
        price = price * Math.pow(10, decimalAdjustment);

        const existingPrice = await Price.findOne({ exchange: "uniswap" });

        if (needsEthConversion) {
          if (existingPrice?.prices?.ETH) {
            price = (price / 10 ** 18) * (existingPrice?.prices?.ETH || 0);
          }
        }

        const prices: Record<string, number> = {};
        Object.assign(prices, existingPrice?.prices || {});
        if (price) {
          prices[symbol] = price;
        }

        await Price.findOneAndUpdate(
          { exchange: "uniswap" },
          {
            prices,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      }
    );
  }
}
