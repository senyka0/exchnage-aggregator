import { RequestHandler } from "express";
import { Price } from "../models/Price";

export class EstimateController {
  getEstimate: RequestHandler = async (req, res) => {
    try {
      const { inputAmount, inputCurrency, outputCurrency } = req.query;

      if (!inputAmount || !inputCurrency || !outputCurrency) {
        res.status(400).json({ error: "Missing required parameters" });
        return;
      }

      const inputAmountNumber = Number(inputAmount);
      const inputCurrencyUpperCase = String(inputCurrency).toUpperCase();
      const outputCurrencyUpperCase = String(outputCurrency).toUpperCase();

      const prices = await Price.find().sort({ updatedAt: -1 });
      let bestExchange = "";
      let bestAmount = 0;

      for (const price of prices) {
        let outputAmount = 0;

        if (
          outputCurrencyUpperCase === "USDT" ||
          outputCurrencyUpperCase === "USDC"
        ) {
          outputAmount =
            Number(inputAmount) *
            (price.prices?.[
              inputCurrencyUpperCase as keyof typeof price.prices
            ] || 0);
        } else if (
          inputCurrencyUpperCase === "USDT" ||
          inputCurrencyUpperCase === "USDC"
        ) {
          outputAmount =
            Number(inputAmount) /
            (price.prices?.[
              outputCurrencyUpperCase as keyof typeof price.prices
            ] || 1);
        } else {
          const inputPrice =
            price.prices?.[
              inputCurrencyUpperCase as keyof typeof price.prices
            ] || 0;
          const outputPrice =
            price.prices?.[
              outputCurrencyUpperCase as keyof typeof price.prices
            ] || 0;
          if (outputPrice > 0) {
            outputAmount =
              (Number(inputAmountNumber) * inputPrice) / outputPrice;
          }
        }

        if (outputAmount > bestAmount) {
          bestAmount = outputAmount;
          bestExchange = price.exchange || "";
        }
      }

      res.json({ exchangeName: bestExchange, outputAmount: bestAmount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  };
}
