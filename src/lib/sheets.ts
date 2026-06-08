/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { google } from 'googleapis';

let sheetsClient: any = null;

/**
 * Returns a configured Google Sheets client.
 * Decodes the base64-encoded Service Account JSON key from environment variables.
 * Safe to be called on the server side.
 */
export function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  const base64Secret = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!base64Secret) {
    console.warn('GOOGLE_SERVICE_ACCOUNT_JSON was not provided. Using offline mock mode.');
    return null;
  }

  // Clean brackets if any were accidentally preserved in string
  const cleanedSecret = base64Secret.replace(/^[\["]+|[\]"]+$/g, '');

  try {
    const rawJson = Buffer.from(cleanedSecret, 'base64').toString('utf8');
    const credentials = JSON.parse(rawJson);

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    return null;
  }
}

/**
 * Normalizes problem ranges retrieved from Google Sheets API
 */
export async function fetchProblemsFromSheet(spreadsheetId: string): Promise<any[] | null> {
  const client = getSheetsClient();
  if (!client) {
    return null;
  }

  const cleanedSpreadsheetId = spreadsheetId.replace(/^[\["]+|[\]"]+$/g, '');

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId: cleanedSpreadsheetId,
      range: 'Sheet1!A2:H', // A=ID, B=Title, C=Difficulty, D=Description, E=Points, F=Category, G=Boilerplates, H=Test Cases
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn('No problem data found in Google Sheet.');
      return [];
    }

    return rows.map((row: any) => {
      // Decode boilerplate JSON and test cases JSON safety
      let boilerplate = {};
      try {
        boilerplate = row[6] ? JSON.parse(row[6]) : {};
      } catch (e) {
        // Fallback or treat as raw python/javascript boilerplate string
        boilerplate = {
          javascript: row[6] || '// Write your code here'
        };
      }

      let testCases = [];
      try {
        testCases = row[7] ? JSON.parse(row[7]) : [];
      } catch (e) {
        testCases = [];
      }

      return {
        id: row[0],
        title: row[1],
        difficulty: row[2] || 'Easy',
        description: row[3] || '',
        points: parseInt(row[4], 10) || 10,
        category: row[5] || 'General',
        boilerplate,
        test_cases: testCases,
      };
    });
  } catch (error) {
    console.error('Failed to fetch problems from Google Sheet:', error);
    return null;
  }
}
