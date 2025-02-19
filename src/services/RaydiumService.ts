import axios from "axios";
import { config } from "../config/config";
import { Price } from "../models/Price";

export class RaydiumService {
  private readonly RAYDIUM_API = "https://api-v3.raydium.io/pools/info/ids";
  private readonly POOLS = config.supportedDEXPairs.solana;

  private async fetchPoolPrices() {
    try {
      const poolIds = Object.values(this.POOLS).map((pool) => pool.address);
      const response = await axios.get(
        `${this.RAYDIUM_API}?ids=${poolIds.join(",")}`
      );
      const poolsData = response.data.data;
      const prices: Record<string, number> = {};

      for (const [symbol, poolInfo] of Object.entries(this.POOLS)) {
        const poolData = poolsData.find(
          (pool: any) => pool.id === poolInfo.address
        );
        if (!poolData) continue;

        let price = Number(poolData.price);

        if (poolData.mintA.address === poolInfo.baseToken) {
          price = 1 / price;
        }

        if (poolInfo.needsSolConversion) {
          const solPrice = poolsData.find(
            (pool: any) => pool.id === this.POOLS.SOL.address
          )?.price;
          if (solPrice) {
            price *= Number(solPrice);
          }
        }

        prices[symbol] = price;
      }

      await Price.findOneAndUpdate(
        { exchange: "raydium" },
        {
          prices,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("Raydium API error:", error);
    }
  }

  async startPolling() {
    const poll = async () => {
      await this.fetchPoolPrices();
    };

    await poll();
    setInterval(poll, config.pollingInterval);
  }
}
