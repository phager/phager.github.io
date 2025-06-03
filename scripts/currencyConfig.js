export const CURRENCIES = [
    {
        code: "USD",
        name: "US Dollar",
        interest: 4.5,
        spot: 1.0,
        forward: 1.0,
    },
    {
        code: "EUR",
        name: "Euro",
        interest: 2.5,
        spot: 1.085,
        forward: 1.092,
    },
    {
        code: "JPY",
        name: "Japanese Yen",
        interest: 0.5,
        spot: 0.0067,
        forward: 0.0069,
    },
    {
        code: "GBP",
        name: "British Pound",
        interest: 5.0,
        spot: 1.265,
        forward: 1.258,
    },
    {
        code: "CHF",
        name: "Swiss Franc",
        interest: 0.25,
        spot: 1.12,
        forward: 1.135,
    },
    {
        code: "CAD",
        name: "Canadian Dollar",
        interest: 4.25,
        spot: 0.73,
        forward: 0.725,
    },
    {
        code: "AUD",
        name: "Australian Dollar",
        interest: 4.35,
        spot: 0.668,
        forward: 0.665,
    },
    {
        code: "NOK",
        name: "Norwegian Krone",
        interest: 4.5,
        spot: 0.093,
        forward: 0.0945,
    },
];

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
