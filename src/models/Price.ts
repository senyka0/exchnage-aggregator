import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  exchange: String,
  prices: {
    BTC: Number,
    ETH: Number,
    SOL: Number,
  },
  updatedAt: { type: Date, default: Date.now },
});

export const Price = mongoose.model("Price", priceSchema);
