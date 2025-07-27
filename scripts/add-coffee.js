#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
Usage: node scripts/add-coffee.js <company-name>

This will add a new coffee entry with stub values for all required fields.

Example:
  node scripts/add-coffee.js "Blue Bottle Coffee"
`);
    process.exit(1);
}

const companyName = args[0];
const tablesFilePath = path.join(__dirname, "..", "pages", "data", "tables.js");

// Read the current tables file
let content;
try {
    content = fs.readFileSync(tablesFilePath, "utf8");
} catch (error) {
    console.error("Error reading tables.js file:", error.message);
    process.exit(1);
}

// Create the new coffee entry
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
const newEntry = `            {
                logo: {
                    src: "",
                    alt: "${companyName} logo",
                },
                company: {
                    text: "${companyName}",
                    link: "",
                },
                coffee: {
                    text: "",
                    link: "",
                },
                tier: "",
                dateAdded: "${today}",
            },`;

// Find the position to insert the new entry
// Look for the coffee rows array
const coffeeRowsMatch = content.match(/coffee:\s*\{\s*headers:\s*\[.*?\],\s*rows:\s*\[/s);
if (!coffeeRowsMatch) {
    console.error("Could not find coffee rows array in tables.js");
    process.exit(1);
}

// Find the position right after the opening bracket of the rows array
const rowsStartIndex = content.indexOf("rows: [", coffeeRowsMatch.index);
const insertPosition = content.indexOf("[", rowsStartIndex) + 1;

// Insert the new entry at the beginning of the rows array
const newContent =
    content.substring(0, insertPosition) + "\n" + newEntry + content.substring(insertPosition);

// Write the updated content back to the file
try {
    fs.writeFileSync(tablesFilePath, newContent, "utf8");
    console.log(`✅ Successfully added new coffee entry for "${companyName}"`);
    console.log(`📝 Added stub values for all fields:`);
    console.log(`   - logo: src="", alt="${companyName} logo"`);
    console.log(`   - company: text="${companyName}", link=""`);
    console.log(`   - coffee: text="", link=""`);
    console.log(`   - tier: ""`);
    console.log(`   - dateAdded: "${today}"`);
    console.log(`\n💡 You can now edit the file to fill in the actual values.`);
} catch (error) {
    console.error("Error writing to tables.js file:", error.message);
    process.exit(1);
}
