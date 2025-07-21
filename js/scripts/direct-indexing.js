
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('investment-slider');
    const sliderValue = document.getElementById('slider-value');
    const downloadButton = document.getElementById('download-portfolio');
    const portfolioContainer = document.getElementById('portfolio-container');

    let sp500Data = [];
    let stockPrices = {};

    // Replace with your own API key from Financial Modeling Prep
    const apiKey = 'YOUR_API_KEY';
    const sp500ConstituentsUrl = `https://financialmodelingprep.com/api/v3/sp500_constituent?apikey=${apiKey}`;

    // Show loading indicator
    function showLoader() {
        portfolioContainer.innerHTML = '<div class="loader"></div>';
    }

    // Fetch S&P 500 constituents and their prices
    async function fetchSP500Data() {
        showLoader();
        try {
            const response = await fetch(sp500ConstituentsUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const constituents = await response.json();
            sp500Data = constituents;

            const symbols = constituents.map(stock => stock.symbol).join(',');
            const pricesUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`;

            const pricesResponse = await fetch(pricesUrl);
            if (!pricesResponse.ok) {
                throw new Error(`HTTP error! status: ${pricesResponse.status}`);
            }
            const pricesData = await pricesResponse.json();
            pricesData.forEach(stock => {
                stockPrices[stock.symbol] = stock.price;
            });

            updatePortfolio();
        } catch (error) {
            console.error('Error fetching S&P 500 data:', error);
            portfolioContainer.innerHTML = '<p>Error loading data. Please try again later.</p>';
        }
    }

    // Update portfolio based on slider value
    function updatePortfolio() {
        const investmentAmount = parseInt(slider.value);
        sliderValue.textContent = investmentAmount.toLocaleString();

        if (sp500Data.length === 0) {
            return;
        }

        const portfolio = sp500Data.map(stock => {
            const weight = stock.weight / 100;
            const dollarsToInvest = investmentAmount * weight;
            const price = stockPrices[stock.symbol] || 0;
            const shares = price > 0 ? (dollarsToInvest / price).toFixed(4) : 0;

            return {
                symbol: stock.symbol,
                name: stock.name,
                shares: shares,
                investment: dollarsToInvest.toFixed(2)
            };
        }).filter(stock => stock.investment > 1); // Only include stocks where investment is at least $1

        displayPortfolio(portfolio);
    }

    // Display the portfolio in a table
    function displayPortfolio(portfolio) {
        if (portfolio.length === 0) {
            portfolioContainer.innerHTML = '<p>No stocks to display for this investment amount.</p>';
            return;
        }

        const table = `
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Shares</th>
                        <th>Investment</th>
                    </tr>
                </thead>
                <tbody>
                    ${portfolio.map(stock => `
                        <tr>
                            <td>${stock.symbol}</td>
                            <td>${stock.name}</td>
                            <td>${stock.shares}</td>
                            <td>$${stock.investment}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        portfolioContainer.innerHTML = table;
    }

    // Download portfolio as JSON
    function downloadPortfolio() {
        const investmentAmount = parseInt(slider.value);
        const portfolio = sp500Data.map(stock => {
            const weight = stock.weight / 100;
            const dollarsToInvest = investmentAmount * weight;
            const price = stockPrices[stock.symbol] || 0;
            const shares = price > 0 ? (dollarsToInvest / price).toFixed(4) : 0;

            return {
                symbol: stock.symbol,
                name: stock.name,
                shares: shares,
                investment: dollarsToInvest.toFixed(2)
            };
        }).filter(stock => stock.investment > 1);

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolio, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "direct_indexing_portfolio.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    // Event Listeners
    slider.addEventListener('input', updatePortfolio);
    downloadButton.addEventListener('click', downloadPortfolio);

    // Initial load
    fetchSP500Data();
});
