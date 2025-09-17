import 'dotenv/config';
import { writeJSONToFile } from './util.js';

const listUrl = 'http://api.marketstack.com/v2/tickerslist';

const fetchTickers = async () => {
	const params = new URLSearchParams({
		access_key: process.env.API_KEY as string,
		limit: '100',
	});

	const data = await fetch(`${listUrl}?${params}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const json = await data.json();
	return json;
};

const main = async () => {
	const filename = 'tickers.json';
	const tickers = await fetchTickers();
	await writeJSONToFile(tickers, filename);
};

await main();
