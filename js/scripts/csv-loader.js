import Papa from 'papaparse';

// Fetches and parses a CSV file, making the data available to other scripts.

export function loadCSV(url, callback) {
    Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            callback(results.data);
        },
        error: function(error) {
            console.error('Error loading or parsing CSV:', error);
        }
    });
}