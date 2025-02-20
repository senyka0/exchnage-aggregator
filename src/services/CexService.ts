import { binance, kucoin, Exchange } from "ccxt";
import { Price } from "../models/Price";
import { config } from "../config/config";
import { HttpsProxyAgent } from "https-proxy-agent";

export class CexService {
  private binanceClient: binance;
  private kucoinClient: kucoin;
  private pairs = config.supportedCEXPairs;

  constructor() {
    this.binanceClient = new binance();
    if (config.proxyUrl) {
      this.binanceClient.httpAgent = new HttpsProxyAgent(config.proxyUrl);
    }
    this.kucoinClient = new kucoin();
  }

  private async updatePrices(exchange: string, prices: Record<string, number>) {
    await Price.findOneAndUpdate(
      { exchange },
      {
        prices,
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  }

  private async fetchExchangePrices(client: Exchange, exchange: string) {
    try {
      const prices: Record<string, number> = {};

      for (const [key, pair] of Object.entries(this.pairs)) {
        const ticker = await client.fetchTicker(pair);
        prices[key] = ticker.last ?? 0;
      }
      await this.updatePrices(exchange, prices);
    } catch (error) {
      console.error(`${exchange} API error:`, error);
    }
  }

  async startPolling() {
    const poll = async () => {
      await Promise.all([
        this.fetchExchangePrices(this.binanceClient, "binance"),
        this.fetchExchangePrices(this.kucoinClient, "kucoin"),
      ]);
    };

    await poll();
    setInterval(poll, config.pollingInterval);
  }

  async getPrices() {
    return Price.find().sort({ updatedAt: -1 });
  }
}
