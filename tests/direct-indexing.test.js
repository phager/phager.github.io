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
        expect(msft.shares).toBe(17);
        expect(msft.investment).toBe(5100);

        const amzn = portfolio.find(s => s.symbol === 'AMZN');
        expect(amzn).toBeUndefined();

        expect(totalInvestment).toBe(9850);
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
});