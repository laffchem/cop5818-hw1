import fs from 'fs/promises';
import path from 'path';

export const writeJSONToFile = async (data: any, filename: string) => {
	const filepath = path.join('./data', filename);
	try {
		await fs.writeFile(filepath, JSON.stringify(data, null, 2));
	} catch (err) {
		throw new Error(`Failed to write file: ${err}`);
	}
};

export const fileExists = async (filepath: string) => {
	try {
		await fs.access(filepath);
		return true;
	} catch {
		return false;
	}
};

export const fetchTickers = async (listUrl: string) => {
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

export const readTickersFromFile = async (filename: string) => {
	const filepath = path.join('./data', filename);
	try {
		const data = await fs.readFile(filepath, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		throw new Error(`Failed to read file: ${err}`);
	}
};
