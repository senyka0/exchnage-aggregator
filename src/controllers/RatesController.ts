import { RequestHandler } from "express";
import { Price } from "../models/Price";

export class RatesController {
  getRates: RequestHandler = async (req, res) => {
    try {
      const { baseCurrency, quoteCurrency } = req.query;

      if (!baseCurrency || !quoteCurrency) {
        res.status(400).json({ error: "Missing required parameters" });
        return;
      }

      const baseUpperCase = String(baseCurrency).toUpperCase();
      const quoteUpperCase = String(quoteCurrency).toUpperCase();

      const prices = await Price.find().sort({ updatedAt: -1 });
      const rates = [];

      for (const price of prices) {
        if (!price.exchange) continue;

        let rate = 0;
        if (quoteUpperCase === "USDT" || quoteUpperCase === "USDC") {
          rate =
            price.prices?.[baseUpperCase as keyof typeof price.prices] || 0;
        } else if (baseUpperCase === "USDT" || baseUpperCase === "USDC") {
          const quotePrice =
            price.prices?.[quoteUpperCase as keyof typeof price.prices];
          rate = quotePrice ? 1 / quotePrice : 0;
        } else {
          const basePrice =
            price.prices?.[baseUpperCase as keyof typeof price.prices];
          const quotePrice =
            price.prices?.[quoteUpperCase as keyof typeof price.prices];
          if (basePrice && quotePrice) {
            rate = quotePrice / basePrice;
          }
        }

        if (rate > 0) {
          rates.push({
            exchangeName: price.exchange,
            rate,
          });
        }
      }

      res.json(rates);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  };
}
