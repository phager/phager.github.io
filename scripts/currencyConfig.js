// API Configuration
export const API_CONFIG = {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    BASE_URL: "https://www.alphavantage.co/query",
    CURRENCIES: ["USD", "EUR", "JPY", "GBP", "CHF", "CAD", "AUD", "NOK"],
};

// Currency metadata
export const CURRENCY_METADATA = {
    USD: { name: "US Dollar" },
    EUR: { name: "Euro" },
    JPY: { name: "Japanese Yen" },
    GBP: { name: "British Pound" },
    CHF: { name: "Swiss Franc" },
    CAD: { name: "Canadian Dollar" },
    AUD: { name: "Australian Dollar" },
    NOK: { name: "Norwegian Krone" },
};

// Function to get currency data
export async function getCurrencies() {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`,
        );
        const data = await response.json();

        // For now, return static data until we implement full API integration
        return [
            {
                code: "USD",
                name: CURRENCY_METADATA.USD.name,
                interest: 4.5,
                spot: 1.0,
                forward: 1.0,
            },
            {
                code: "EUR",
                name: CURRENCY_METADATA.EUR.name,
                interest: 2.5,
                spot: 1.085,
                forward: 1.092,
            },
            {
                code: "JPY",
                name: CURRENCY_METADATA.JPY.name,
                interest: 0.5,
                spot: 0.0067,
                forward: 0.0069,
            },
            {
                code: "GBP",
                name: CURRENCY_METADATA.GBP.name,
                interest: 5.0,
                spot: 1.265,
                forward: 1.258,
            },
            {
                code: "CHF",
                name: CURRENCY_METADATA.CHF.name,
                interest: 0.25,
                spot: 1.12,
                forward: 1.135,
            },
            {
                code: "CAD",
                name: CURRENCY_METADATA.CAD.name,
                interest: 4.25,
                spot: 0.73,
                forward: 0.725,
            },
            {
                code: "AUD",
                name: CURRENCY_METADATA.AUD.name,
                interest: 4.35,
                spot: 0.668,
                forward: 0.665,
            },
            {
                code: "NOK",
                name: CURRENCY_METADATA.NOK.name,
                interest: 4.5,
                spot: 0.093,
                forward: 0.0945,
            },
        ];
    } catch (error) {
        console.error("Error fetching currency data:", error);
        throw error;
    }
}

export const TABS = ["Summary", "Unhedged", "Forward", "Hedged", "Extremes", "Example"];

export const TAB_EXPLANATIONS = {
    Unhedged:
        "Unhedged %: Shows the simple interest rate differential between the two currencies (invest - fund).",
    Forward:
        "Forward %: Shows the implied forward premium/discount based on current spot and forward rates. This is a data validation tool. (All forwards are 1-year contracts.)",
    Hedged: "Hedged %: Shows the annualized return of a USD-based carry trade, simulating a US investor funding in one currency, investing in another, and hedging FX risk using forwards. Expressed as a % of initial USD invested. (All forwards are 1-year contracts.)",
    Example:
        "Worked Example: Step-by-step calculation of a USD-based FX-hedged carry trade. (All forwards are 1-year contracts.)",
    Summary:
        "Summary: Lists each currency and its interest, spot, and forward rates. (All forwards are 1-year contracts.)",
    Extremes: "Extremes: Shows the currency pairs based on hedged carry trade returns.",
};
