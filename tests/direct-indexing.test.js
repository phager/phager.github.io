import { calculatePortfolio } from '../js/scripts/direct-indexing.js';

const stockData = [
    { "Company": "Apple", "Symbol": "AAPL", "Weight": "20%", "Price": "150" },
    { "Company": "Google", "Symbol": "GOOGL", "Weight": "15%", "Price": "2800" },
    { "Company": "Microsoft", "Symbol": "MSFT", "Weight": "10%", "Price": "300" },
    { "Company": "Amazon", "Symbol": "AMZN", "Weight": "5%", "Price": "3400" }
];

describe('calculatePortfolio', () => {
    test('should allocate portfolio based on ideal weights', () => {
        const investmentAmount = 10000;
        const { portfolio, totalInvestment } = calculatePortfolio(investmentAmount, stockData);

        expect(portfolio.length).toBe(3);

        const aapl = portfolio.find(s => s.symbol === 'AAPL');
        expect(aapl.shares).toBe(13);
        expect(aapl.investment).toBe(1950);

        const googl = portfolio.find(s => s.symbol === 'GOOGL');
        expect(googl.shares).toBe(1);
        expect(googl.investment).toBe(2800);

        const msft = portfolio.find(s => s.symbol === 'MSFT');
        expect(msft.shares).toBe(3);
        expect(msft.investment).toBe(900);

        const amzn = portfolio.find(s => s.symbol === 'AMZN');
        expect(amzn).toBeUndefined();

        expect(totalInvestment).toBe(5650);
    });

    test('should handle zero investment', () => {
        const { portfolio, totalInvestment } = calculatePortfolio(0, stockData);
        expect(portfolio.length).toBe(0);
        expect(totalInvestment).toBe(0);
    });

    test('should handle empty stock data', () => {
        const { portfolio, totalInvestment } = calculatePortfolio(10000, []);
        expect(portfolio.length).toBe(0);
        expect(totalInvestment).toBe(0);
    });
    test('should handle a small investment with a single stock', () => {
        const investmentAmount = 1;
        const stockData = [
            { "Company": "Test Stock", "Symbol": "TEST", "Weight": "100%", "Price": "10" }
        ];
        const { portfolio, totalInvestment } = calculatePortfolio(investmentAmount, stockData);
        expect(portfolio.length).toBe(0);
        expect(totalInvestment).toBe(0);
    });

    test('should correctly use remaining cash in the greedy fill step', () => {
        const stockData = [
            { "Company": "Stock A", "Symbol": "A", "Weight": "50%", "Price": "100" },
            { "Company": "Stock B", "Symbol": "B", "Weight": "50%", "Price": "120" }
        ];
        const investmentAmount = 1000;
        const { portfolio, totalInvestment } = calculatePortfolio(investmentAmount, stockData);

        // Ideal investment: A = $500, B = $500
        // Initial allocation:
        //   A: floor(500/100) = 5 shares ($500)
        //   B: floor(500/120) = 4 shares ($480)
        // Total initial investment: $980. Remaining cash: $20.
        // The greedy algorithm should not buy anything else as the remaining cash is less than any stock price.

        const stockA = portfolio.find(s => s.symbol === 'A');
        const stockB = portfolio.find(s => s.symbol === 'B');

        expect(stockA.shares).toBe(5);
        expect(stockA.investment).toBe(500);
        expect(stockB.shares).toBe(4);
        expect(stockB.investment).toBe(480);
        expect(totalInvestment).toBe(980);
    });
});
