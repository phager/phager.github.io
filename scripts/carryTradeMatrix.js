class CarryTradeMatrix {
    constructor() {
        this.interestRates = {
            'USD': 4.50, // Fed Funds Rate
            'EUR': 2.50, // ECB Deposit Rate
            'JPY': 0.50, // BOJ Policy Rate
            'GBP': 5.00, // Bank of England Base Rate
            'CHF': 0.25, // SNB Policy Rate (after cuts)
            'CAD': 4.25, // Bank of Canada Rate
            'AUD': 4.35, // RBA Cash Rate
            'NOK': 4.50  // Norges Bank Rate
        };

        this.exchangeRates = {
            'USD': 1.0000,
            'EUR': 1.0850, // EUR/USD
            'JPY': 0.0067, // USD/JPY ≈ 149
            'GBP': 1.2650, // GBP/USD
            'CHF': 1.1200, // USD/CHF ≈ 0.893
            'CAD': 0.7300, // USD/CAD ≈ 1.37
            'AUD': 0.6680, // AUD/USD
            'NOK': 0.0930  // USD/NOK ≈ 10.75
        };

        this.forwardRates = {
            'USD': 1.0000,
            'EUR': 1.0920, // EUR/USD forward
            'JPY': 0.0069, // USD/JPY forward ≈ 145
            'GBP': 1.2580, // GBP/USD forward
            'CHF': 1.1350, // USD/CHF forward
            'CAD': 0.7250, // USD/CAD forward
            'AUD': 0.6650, // AUD/USD forward
            'NOK': 0.0945  // USD/NOK forward
        };

        this.currencies = Object.keys(this.interestRates);
        this.activeTab = 'unhedged';
        this.init();
    }

    init() {
        this.createTabs();
        this.createMatrix();
        this.addEventListeners();
    }

    createTabs() {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs';
        
        const tabs = ['Unhedged', 'Hedged', 'Forward'];
        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.textContent = tab;
            button.dataset.tab = tab.toLowerCase();
            button.className = this.activeTab === tab.toLowerCase() ? 'active' : '';
            tabsContainer.appendChild(button);
        });

        const root = document.getElementById('root');
        root.appendChild(tabsContainer);
    }

    createMatrix() {
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-container';
        
        const table = document.createElement('table');
        table.className = 'carry-trade-matrix';

        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Add empty cell for top-left corner
        headerRow.appendChild(document.createElement('th'));
        
        // Add currency headers
        this.currencies.forEach(currency => {
            const th = document.createElement('th');
            th.textContent = currency;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create matrix body
        const tbody = document.createElement('tbody');
        this.currencies.forEach(currency1 => {
            const row = document.createElement('tr');
            
            // Add row header
            const rowHeader = document.createElement('th');
            rowHeader.textContent = currency1;
            row.appendChild(rowHeader);
            
            // Add matrix cells
            this.currencies.forEach(currency2 => {
                const cell = document.createElement('td');
                if (currency1 === currency2) {
                    cell.textContent = '-';
                } else {
                    const rate = this.calculateCarryTradeRate(currency1, currency2);
                    cell.textContent = rate.toFixed(2) + '%';
                    cell.className = rate > 0 ? 'positive' : 'negative';
                }
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        matrixContainer.appendChild(table);
        
        const root = document.getElementById('root');
        root.appendChild(matrixContainer);
    }

    calculateCarryTradeRate(currency1, currency2) {
        const rate1 = this.interestRates[currency1];
        const rate2 = this.interestRates[currency2];
        
        if (this.activeTab === 'unhedged') {
            return rate1 - rate2;
        } else if (this.activeTab === 'hedged') {
            const spot1 = this.exchangeRates[currency1];
            const spot2 = this.exchangeRates[currency2];
            const forward1 = this.forwardRates[currency1];
            const forward2 = this.forwardRates[currency2];
            
            const spotReturn = (spot2 / spot1 - 1) * 100;
            const forwardReturn = (forward2 / forward1 - 1) * 100;
            
            return rate1 - rate2 + (this.activeTab === 'hedged' ? spotReturn : forwardReturn);
        } else {
            const forward1 = this.forwardRates[currency1];
            const forward2 = this.forwardRates[currency2];
            const forwardReturn = (forward2 / forward1 - 1) * 100;
            
            return rate1 - rate2 + forwardReturn;
        }
    }

    addEventListeners() {
        const tabs = document.querySelectorAll('.tabs button');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateMatrix();
            });
        });
    }

    updateMatrix() {
        const matrix = document.querySelector('.carry-trade-matrix');
        const cells = matrix.querySelectorAll('tbody td');
        
        let cellIndex = 0;
        this.currencies.forEach(currency1 => {
            this.currencies.forEach(currency2 => {
                if (currency1 !== currency2) {
                    const rate = this.calculateCarryTradeRate(currency1, currency2);
                    cells[cellIndex].textContent = rate.toFixed(2) + '%';
                    cells[cellIndex].className = rate > 0 ? 'positive' : 'negative';
                }
                cellIndex++;
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new CarryTradeMatrix();
}); 