import yahooFinance from 'yahoo-finance2';
import fs from 'fs/promises';
import { fileExists } from './util.js'; // Use your existing fileExists function

export class YahooStuff {
	constructor(public tickers: string[]) {
		this.tickers = tickers;
	}

	usTrending = async () => {
		const trending = await yahooFinance.trendingSymbols('US');
		if (await fileExists('./data/trending.txt')) {
			console.log('trending.txt already exists. Exiting...');
			return;
		}
		for (const symbol of trending.quotes) {
			fs.appendFile('./data/trending.txt', `${symbol.symbol}\n`);
			return trending;
		}
	};

	getMarketData = async (tickers: string[]): Promise<any> => {
		// did this to satisfy the requirement.
		const data = new Set(tickers);
		const tickerArray = Array.from(data);
		const results = [];
		if (!(await fileExists('./data/market_data.json'))) {
			for (const ticker of tickerArray) {
				try {
					const quote = await yahooFinance.quote(ticker);
					results.push(quote);
				} catch (error) {
					console.error(
						'Error fetching market data for ticker:',
						ticker,
						error
					);
				}
			}
			await fs.writeFile('./data/market_data.json', JSON.stringify(results));
		}
		return results;
	};

	compareTrending = async (trending: string, tickers: string) => {
		const trendingFile = await fs.readFile(trending, 'utf-8');
		const tickerFile = await fs.readFile(tickers, 'utf-8');
		const tickerList = JSON.parse(tickerFile).data.map(
			(item: any) => item.ticker
		);
		const trendingList = trendingFile
			.split('\n')
			.filter((line) => line.trim() !== '');
		const common = trendingList.filter((symbol) => tickerList.includes(symbol));

		const outputPath = './data/tickers_trending_from_dataset.txt';

		// Check if file exists, if not, write it
		if (!(await fileExists(outputPath))) {
			await fs.writeFile(outputPath, common.join('\n'));
			console.log(
				`Created ${outputPath} with ${common.length} trending tickers`
			);
		} else {
			console.log(`File ${outputPath} already exists, skipping write`);
		}
	};
}
