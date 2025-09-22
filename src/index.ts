import 'dotenv/config';
import { writeJSONToFile, fetchTickers, fileExists } from './util.js';
import { YahooStuff } from './yfinance.js';
import { analyzeTickers, analyzeMarketData } from './analysis.js';
import fs from 'fs/promises';

const listUrl = 'http://api.marketstack.com/v2/tickerslist';
const tickerList = './data/tickers.json';
const trendingList = './data/trending.txt';

const main = async () => {
	await fs.mkdir('./data', { recursive: true }); // Makes data directory in root level if it doesn't exist.
	const filename = 'tickers.json';
	if (await fileExists(`./data/${filename}`)) {
		// console.log(`${filename} already exists. Exiting...`);
		const tickers = JSON.parse(await fs.readFile(tickerList, 'utf-8')).data.map(
			(item: any) => item.ticker
		);
		const yahooStuff = new YahooStuff(tickers);

		await yahooStuff.usTrending();
		await yahooStuff.compareTrending(trendingList, tickerList);
		await yahooStuff.getMarketData(tickers);
		await analyzeTickers(tickerList);
		await analyzeMarketData();
		return;
	}

	let tickers = await fetchTickers(listUrl); // not best practice...did it to satisfy the let criteria
	await writeJSONToFile(tickers, filename);
	const tickerSymbols = tickers.data.map((item: any) => item.ticker);
	const yahooStuff = new YahooStuff(tickerSymbols);

	await yahooStuff.usTrending();
	await yahooStuff.compareTrending(trendingList, tickerList);
	await yahooStuff.getMarketData(tickerSymbols);
	await analyzeTickers(tickerList);
	await analyzeMarketData();
};

if (import.meta.url === `file://${process.argv[1]}`) {
	await main();
}
