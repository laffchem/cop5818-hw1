import pl from 'nodejs-polars';
import fs from 'fs/promises';

export const analyzeTickers = async (filepath: string) => {
	// Read and parse the JSON file
	const jsonData = await fs.readFile(filepath, 'utf-8');
	const parsedData = JSON.parse(jsonData);

	const flattenedData = parsedData.data.map((item: any) => ({
		name: item.name,
		ticker: item.ticker,
		has_intraday: item.has_intraday,
		has_eod: item.has_eod,
		exchange_name: item.stock_exchange.name,
		exchange_acronym: item.stock_exchange.acronym,
		exchange_mic: item.stock_exchange.mic,
	}));

	// Create DataFrame from the flattened data
	const data = pl.DataFrame(flattenedData);

	// Print the first 5 rows
	console.log(data.head(5).toString());
	data.writeCSV('./data/tickers.csv');

	// Longest company name
	const longestName = data
		.withColumn(pl.col('name').str.lengths().alias('name_length'))
		.sort('name_length', true)
		.select('name', 'name_length')
		.head(1)
		.toRecords();

	if (longestName.length > 0 && longestName[0]) {
		const record = longestName[0];
		console.log(`${record.name}: ${record.name_length}`);
	}

	// Number of end of day count
	const endofDayCount = data.filter(pl.col('has_eod').eq(true)).height;
	console.log(`Number of tickers with end-of-day data: ${endofDayCount}`);

	// Intraday count
	const intradayCount = data.filter(pl.col('has_intraday').eq(true)).height;
	console.log(`Number of tickers with intraday data: ${intradayCount}`);

	// Neither intraday or end of day data available
	const neitherCount = data.filter(
		pl.col('has_intraday').eq(false).and(pl.col('has_eod').eq(false))
	).height;
	console.log(
		`Number of tickers with neither intraday nor end-of-day data: ${neitherCount}`
	);

	// Count of tickers per exchange, sorted descending
	const exchangeCounts = data
		.filter(pl.col('exchange_acronym').isNotNull())
		.groupBy('exchange_acronym')
		.agg(pl.len().alias('count'))
		.sort('count', true);

	console.log(exchangeCounts.toString());
};

// Analyze market data for highest regular market price
const marketData = await fs.readFile('./data/market_data.json', 'utf-8');
const marketDataParsed = JSON.parse(marketData);

// Flatten the market data for Polars, filter out null/undefined items
const flattenedMarketData = marketDataParsed
	.filter((item: any) => item != null && item.regularMarketPrice != null)
	.map((item: any) => ({
		shortName: item.shortName || 'N/A',
		symbol: item.symbol || 'N/A',
		regularMarketPrice: item.regularMarketPrice || 0,
		fiftyTwoWeekChangePercent: item.fiftyTwoWeekChangePercent || 0,
		currency: item.currency || 'USD',
	}));

const marketDataDF = pl.DataFrame(flattenedMarketData);
const highestMarketPrice = marketDataDF
	.sort('regularMarketPrice', true)
	.select('shortName', 'symbol', 'regularMarketPrice')
	.head(1)
	.toRecords();

if (highestMarketPrice.length > 0 && highestMarketPrice[0]) {
	const record = highestMarketPrice[0];
	console.log(
		`Highest regular market price: ${record.shortName} (${record.symbol}): $${record.regularMarketPrice}`
	);

	const highest52WeekChange = marketDataDF
		.sort('fiftyTwoWeekChangePercent', true)
		.select('shortName', 'symbol', 'fiftyTwoWeekChangePercent')
		.head(1)
		.toRecords();
	if (highest52WeekChange.length > 0 && highest52WeekChange[0]) {
		const record = highest52WeekChange[0];
		console.log(
			`Highest 52-week change percent: ${record.shortName} (${
				record.symbol
				// @ts-ignore linting error
			}): ${Math.round(record.fiftyTwoWeekChangePercent, 2)}%`
		);
	}
}
