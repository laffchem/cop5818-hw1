import 'dotenv/config';
import { writeJSONToFile, fetchTickers, fileExists } from './util.js';
import { YahooStuff } from './yfinance.js';
import { analyzeTickers } from './analysis.js';
import fs from 'fs/promises';

const listUrl = 'http://api.marketstack.com/v2/tickerslist';
const tickerList = './data/tickers.json';
const trendingList = './data/trending.txt';

const main = async () => {
	const filename = 'tickers.json';
	if (await fileExists(`./data/${filename}`)) {
		// console.log(`${filename} already exists. Exiting...`);
		const tickers = JSON.parse(await fs.readFile(tickerList, 'utf-8')).data.map(
			(item: any) => item.ticker
		);
		const yahooStuff = new YahooStuff(tickers);

		await yahooStuff.usTrending();
		await yahooStuff.compareTrending(trendingList, tickerList);
		await analyzeTickers(tickerList);
		await yahooStuff.getMarketData(tickers);
		return;
	}
	const tickers = await fetchTickers(listUrl);
	await writeJSONToFile(tickers, filename);
	await analyzeTickers(tickerList);
};

await main();
