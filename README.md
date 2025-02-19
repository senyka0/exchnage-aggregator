## Setup
1. Create `.env` file in root directory:
```
MONGODB_URI=your_mongodb_uri
INFURA_KEY=your_infura_key
```
2. Run docker mongodb container:
```
docker compose up
```
3. Install dependencies and run the app:
```
npm install
```
4. Run app:
```
npm build
npm start
```
## Endpoints

### GET /api/rates
Get exchange rates between two currencies.

Query parameters:
- `baseCurrency`: Base currency (e.g., BTC, ETH, SOL, USDT, USDC)
- `quoteCurrency`: Quote currency (e.g., BTC, ETH, SOL, USDT, USDC)

Response example:
### GET /api/estimate
Get best exchange rate for converting between currencies.

Query parameters:
- `inputAmount`: Amount to convert
- `inputCurrency`: Input currency (e.g., BTC, ETH, SOL, USDT, USDC)
- `outputCurrency`: Output currency (e.g., BTC, ETH, SOL, USDT, USDC)

