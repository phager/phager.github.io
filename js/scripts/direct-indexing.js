import { loadCSV } from './csv-loader.js';

export function calculatePortfolio(investmentAmount, stockData) {
    if (stockData.length === 0 || investmentAmount <= 0) {
        return { portfolio: [], totalInvestment: 0 };
    }

    // Initialize portfolio with ideal calculations
    let portfolio = stockData.map(stock => ({
        symbol: stock.Symbol,
        name: stock.Company,
        price: parseFloat(String(stock.Price).replace(/,/g, '')),
        indexWeight: parseFloat(String(stock.Weight).replace('%', '')),
        shares: 0,
        investment: 0,
        idealInvestment: investmentAmount * (parseFloat(String(stock.Weight).replace('%', '')) / 100),
    }));

    // Step 1: Initial allocation based on floor of ideal shares
    portfolio.forEach(stock => {
        if (stock.price > 0) {
            const idealShares = stock.idealInvestment / stock.price;
            const sharesToBuy = Math.floor(idealShares);
            if (sharesToBuy > 0) {
                stock.shares = sharesToBuy;
                stock.investment = sharesToBuy * stock.price;
            }
        }
    });

    let currentInvestment = portfolio.reduce((sum, s) => sum + s.investment, 0);
    let remainingCash = investmentAmount - currentInvestment;

    // Step 2: Greedy fill with remaining cash
    let canStillBuy = true;
    while (canStillBuy) {
        let bestStockToBuy = null;
        let maxErrorReductionPerDollar = 0;

        let stockBoughtInPass = false;

        // Calculate the current total error
        let currentTotalError = 0;
        portfolio.forEach(s => {
            currentTotalError += Math.pow(s.investment - s.idealInvestment, 2);
        });

        portfolio.forEach(stock => {
            if (remainingCash >= stock.price) {
                // Calculate the hypothetical total error if we buy one share of this stock
                let newTotalError = 0;
                portfolio.forEach(s => {
                    const ideal = s.idealInvestment;
                    const actual = s.symbol === stock.symbol ? s.investment + s.price : s.investment;
                    newTotalError += Math.pow(actual - ideal, 2);
                });

                const errorReduction = currentTotalError - newTotalError;
                const errorReductionPerDollar = errorReduction / stock.price;

                if (errorReductionPerDollar > maxErrorReductionPerDollar) {
                    maxErrorReductionPerDollar = errorReductionPerDollar;
                    bestStockToBuy = stock;
                }
            }
        });

        if (bestStockToBuy) {
            const stockToUpdate = portfolio.find(s => s.symbol === bestStockToBuy.symbol);
            stockToUpdate.shares += 1;
            stockToUpdate.investment += stockToUpdate.price;
            remainingCash -= stockToUpdate.price;
            stockBoughtInPass = true;
        }

        canStillBuy = stockBoughtInPass;
    }

    let finalPortfolio = portfolio.filter(stock => stock.shares > 0).map(stock => {
        const percentageOfPortfolio = (stock.investment / investmentAmount * 100);
        const differencePercentage = percentageOfPortfolio - stock.indexWeight;
        return {
            ...stock,
            percentageOfPortfolio: percentageOfPortfolio.toFixed(2),
            differencePercentage: differencePercentage.toFixed(2),
        };
    });

    const totalInvestment = finalPortfolio.reduce((sum, stock) => sum + stock.investment, 0);

    return { portfolio: finalPortfolio, totalInvestment };
}


document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('investment-slider');
    const sliderValue = document.getElementById('slider-value');
    const investmentInput = document.getElementById('investment-input');
    const downloadButton = document.getElementById('download-portfolio');
    const portfolioContainer = document.getElementById('portfolio-container');

    let stockData = [];

    loadCSV('data/stocks.csv', (data) => {
        const filteredStocks = [];
        const removedStocks = [];

        data.forEach(stock => {
            const price = parseFloat(String(stock.Price).replace(/,/g, ''));
            const weight = parseFloat(String(stock.Weight).replace('%', ''));
            const isValid = !isNaN(price) && !isNaN(weight) && stock.Company && stock.Symbol;

            if (isValid) {
                filteredStocks.push(stock);
            } else {
                let reason = [];
                if (isNaN(price)) reason.push(`Invalid Price: ${stock.Price}`);
                if (isNaN(weight)) reason.push(`Invalid Weight: ${stock.Weight}`);
                if (!stock.Company) reason.push(`Missing Company`);
                if (!stock.Symbol) reason.push(`Missing Symbol`);
                removedStocks.push({ stock, reason: reason.join(', ') });
            }
        });

        stockData = filteredStocks;
        if (removedStocks.length > 0) {
            console.warn('The following stocks were removed due to invalid data:', removedStocks);
        }
        updatePortfolio();
    });

    function updatePortfolio() {
        const investmentAmount = parseInt(investmentInput.value);
        slider.value = investmentAmount;
        sliderValue.textContent = investmentAmount.toLocaleString();

        const { portfolio, totalInvestment } = calculatePortfolio(investmentAmount, stockData);
        displayPortfolio(portfolio, totalInvestment, investmentAmount);
    }

    function displayPortfolio(portfolio, totalInvestment, investmentAmount) {
        if (portfolio.length === 0) {
            portfolioContainer.innerHTML = '<p>No stocks to display for this investment amount.</p>';
            return;
        }

        const table = `
            <h3>Total Investment: $${totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Shares</th>
                        <th>Price ($)</th>
                        <th>Investment ($)</th>
                        <th>Ideal Investment ($)</th>
                        <th>% of Portfolio</th>
                        <th>% of Index</th>
                        <th>Difference (%)</th>
                    </tr>
                </thead>
                <tbody>
                    ${portfolio.map((stock, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${stock.symbol}</td>
                            <td>${stock.name}</td>
                            <td>${stock.shares}</td>
                            <td>${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td>${stock.investment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td>${stock.idealInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td>${(stock.investment / investmentAmount * 100).toFixed(2)}%</td>
                            <td>${stock.indexWeight}%</td>
                            <td>${((stock.investment / investmentAmount * 100) - stock.indexWeight).toFixed(2)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        portfolioContainer.innerHTML = table;
    }

    function downloadPortfolio() {
        const investmentAmount = parseInt(investmentInput.value);
        const { portfolio } = calculatePortfolio(investmentAmount, stockData);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "direct_indexing_portfolio.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    slider.addEventListener('input', () => {
        investmentInput.value = slider.value;
        updatePortfolio();
    });
    investmentInput.addEventListener('input', updatePortfolio);
    downloadButton.addEventListener('click', downloadPortfolio);
});
