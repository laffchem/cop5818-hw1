import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export const writeJSONToFile = async (data: any, filename: string) => {
	const filepath = path.join('./data', filename);
	try {
		await fs.writeFile(filepath, JSON.stringify(data, null, 2));
	} catch (err) {
		throw new Error(`Failed to write file: ${err}`);
	}
};
