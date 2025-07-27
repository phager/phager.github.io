# Scripts

## add-coffee.js

A command line utility to quickly add new coffee entries to the `pages/data/tables.js` file.

### Usage

```bash
node scripts/add-coffee.js "Company Name"
```

### Example

```bash
node scripts/add-coffee.js "Blue Bottle Coffee"
```

### What it does

The script adds a new coffee entry with stub values for all required fields:

- **logo**: `src=""`, `alt="[Company Name] logo"`
- **company**: `text="[Company Name]"`, `link=""`
- **coffee**: `text=""`, `link=""`
- **tier**: `""`
- **dateAdded**: Current date in YYYY-MM-DD format

The new entry is added at the beginning of the coffee rows array in `pages/data/tables.js`.

### After running

You can then edit the `pages/data/tables.js` file to fill in the actual values for:
- Logo source URL
- Company and coffee links
- Coffee name
- Tier rating (S, A, B, C, D) 