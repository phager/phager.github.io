class CarryTradeMatrix {
    constructor() {
        // All rates are quoted vs USD for consistency
        this.currencies = [
            {
                code: 'USD',
                name: 'US Dollar',
                interest: 4.50,
                spot: 1.0000,    // USD/USD
                forward: 1.0000, // USD/USD
            },
            {
                code: 'EUR',
                name: 'Euro',
                interest: 2.50,
                spot: 1.0850,    // USD per EUR
                forward: 1.0920, // USD per EUR (forward)
            },
            {
                code: 'JPY',
                name: 'Japanese Yen',
                interest: 0.50,
                spot: 0.0067,    // USD per JPY
                forward: 0.0069, // USD per JPY (forward)
            },
            {
                code: 'GBP',
                name: 'British Pound',
                interest: 5.00,
                spot: 1.2650,    // USD per GBP
                forward: 1.2580, // USD per GBP (forward)
            },
            {
                code: 'CHF',
                name: 'Swiss Franc',
                interest: 0.25,
                spot: 1.1200,    // USD per CHF
                forward: 1.1350, // USD per CHF (forward)
            },
            {
                code: 'CAD',
                name: 'Canadian Dollar',
                interest: 4.25,
                spot: 0.7300,    // USD per CAD
                forward: 0.7250, // USD per CAD (forward)
            },
            {
                code: 'AUD',
                name: 'Australian Dollar',
                interest: 4.35,
                spot: 0.6680,    // USD per AUD
                forward: 0.6650, // USD per AUD (forward)
            },
            {
                code: 'NOK',
                name: 'Norwegian Krone',
                interest: 4.50,
                spot: 0.0930,    // USD per NOK
                forward: 0.0945, // USD per NOK (forward)
            },
        ];
        this.tabs = ['Unhedged', 'Hedged', 'Forward', 'Example'];
        this.activeTab = 'Unhedged';
        this.render();
    }

    // Placeholder for future API integration
    async fetchRatesFromAPI() {
        // Example: fetch rates and update this.currencies
        // await fetch('...');
    }

    render() {
        const root = document.getElementById('root');
        root.innerHTML = '';
        this.renderTabs(root);
        if (this.activeTab === 'Example') {
            this.renderExample(root);
        } else {
            this.renderMatrix(root);
        }
    }

    renderTabs(root) {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs';
        this.tabs.forEach(tab => {
            const button = document.createElement('button');
            button.textContent = tab + (tab !== 'Example' ? ' (%)' : '');
            button.dataset.tab = tab;
            button.className = this.activeTab === tab ? 'active' : '';
            button.addEventListener('click', () => {
                this.activeTab = tab;
                this.render();
            });
            tabsContainer.appendChild(button);
        });
        root.appendChild(tabsContainer);
    }

    renderMatrix(root) {
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-container';

        const table = document.createElement('table');
        table.className = 'carry-trade-matrix';

        // Header rows
        const thead = document.createElement('thead');
        // First header row: axis label for columns
        const axisRow = document.createElement('tr');
        const emptyTh = document.createElement('th');
        emptyTh.setAttribute('aria-hidden', 'true');
        axisRow.appendChild(emptyTh);
        const axisLabelTh = document.createElement('th');
        axisLabelTh.colSpan = this.currencies.length;
        axisLabelTh.style.textAlign = 'center';
        axisLabelTh.textContent = 'Invest';
        axisRow.appendChild(axisLabelTh);
        thead.appendChild(axisRow);

        // Second header row: funding axis label and currency codes
        const headerRow = document.createElement('tr');
        const fundingAxisTh = document.createElement('th');
        fundingAxisTh.scope = 'col';
        fundingAxisTh.className = 'vertical-header rotated-header';
        fundingAxisTh.innerHTML = 'Fund';
        headerRow.appendChild(fundingAxisTh);
        this.currencies.forEach(cur => {
            const th = document.createElement('th');
            th.scope = 'col';
            th.textContent = cur.code;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        this.currencies.forEach(fromCur => {
            const row = document.createElement('tr');
            const rowHeader = document.createElement('th');
            rowHeader.scope = 'row';
            rowHeader.textContent = fromCur.code;
            row.appendChild(rowHeader);
            this.currencies.forEach(toCur => {
                const cell = document.createElement('td');
                if (fromCur.code === toCur.code) {
                    cell.textContent = '-';
                } else {
                    const rate = this.calculateCarryTradeRate(fromCur, toCur);
                    cell.textContent = rate.toFixed(2);
                    cell.className = rate > 0 ? 'positive' : 'negative';
                }
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        matrixContainer.appendChild(table);
        root.appendChild(matrixContainer);
    }

    calculateCarryTradeRate(fromCur, toCur) {
        // All rates are quoted vs USD
        const rFrom = fromCur.interest;
        const rTo = toCur.interest;
        if (this.activeTab === 'Unhedged') {
            return rTo - rFrom;
        } else if (this.activeTab === 'Hedged') {
            // FX-hedged: use spot and forward
            // Calculate implied forward premium/discount
            const spotFrom = fromCur.spot;
            const spotTo = toCur.spot;
            const fwdFrom = fromCur.forward;
            const fwdTo = toCur.forward;
            // Cross rates: USD/TO / USD/FROM = FROM/TO
            const spotCross = spotTo / spotFrom;
            const fwdCross = fwdTo / fwdFrom;
            const forwardPremium = (fwdCross / spotCross - 1) * 100;
            return rTo - rFrom + forwardPremium;
        } else if (this.activeTab === 'Forward') {
            // Only the forward premium/discount
            const spotFrom = fromCur.spot;
            const spotTo = toCur.spot;
            const fwdFrom = fromCur.forward;
            const fwdTo = toCur.forward;
            const spotCross = spotTo / spotFrom;
            const fwdCross = fwdTo / fwdFrom;
            return (fwdCross / spotCross - 1) * 100;
        }
        return 0;
    }

    renderExample(root) {
        // Example: CHF -> NOK, FX-hedged, $10,000 USD
        const initialUSD = 10000;
        const chf = this.currencies.find(c => c.code === 'CHF');
        const nok = this.currencies.find(c => c.code === 'NOK');
        // Step 1: Borrow CHF equivalent to $10,000
        const chfBorrowed = initialUSD / chf.spot;
        // Step 2: Convert CHF to NOK at spot
        const nokReceived = chfBorrowed * (nok.spot / chf.spot);
        // Step 3: Invest NOK at 4.50%
        const nokInterestEarned = nokReceived * (nok.interest / 100);
        const totalNokReceived = nokReceived + nokInterestEarned;
        // Step 4: Lock in forward rates
        // Step 5: At year end, convert NOK to USD at forward rate
        const nokToUsdProceeds = totalNokReceived * nok.forward;
        // Step 6: Repay CHF loan + interest
        const chfInterestOwed = chfBorrowed * (chf.interest / 100);
        const totalChfOwed = chfBorrowed + chfInterestOwed;
        const chfRepaymentInUsd = totalChfOwed * chf.forward;
        // Step 7: Net profit
        const netProfitUsd = nokToUsdProceeds - chfRepaymentInUsd;
        const returnPercent = (netProfitUsd / initialUSD) * 100;
        const rateDifferential = nok.interest - chf.interest;
        // Render
        const container = document.createElement('div');
        container.className = 'worked-example';
        container.innerHTML = `
            <h2>Worked Example: CHF → NOK Carry Trade (FX-Hedged)</h2>
            <div class="bg-green-50 p-4 rounded-lg">
                <h3>Trade Setup (FX-Hedged)</h3>
                <p>Starting with $${initialUSD.toLocaleString()}, borrow CHF (${chf.interest}% rate) and invest in NOK (${nok.interest}% rate).<br>
                Interest rate differential: ${rateDifferential.toFixed(2)}%. Use forward contracts to eliminate FX risk.</p>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4>Day 0 - Trade Entry:</h4>
                    <ul>
                        <li>1. Borrow CHF equivalent to $${initialUSD}: ${chfBorrowed.toFixed(2)} CHF</li>
                        <li>2. Convert CHF to NOK at spot rate (${(nok.spot / chf.spot).toFixed(4)}): ${nokReceived.toFixed(2)} NOK</li>
                        <li>3. Invest NOK at ${nok.interest}% annual interest rate</li>
                        <li>4. Lock in forward rates to hedge FX risk</li>
                    </ul>
                </div>
                <div>
                    <h4>Year End - Trade Settlement:</h4>
                    <ul>
                        <li>1. NOK investment matures: ${nokReceived.toFixed(2)} NOK + ${nokInterestEarned.toFixed(2)} NOK interest = ${totalNokReceived.toFixed(2)} NOK</li>
                        <li>2. Convert NOK to USD at forward rate (${nok.forward}): $${nokToUsdProceeds.toFixed(2)}</li>
                        <li>3. Repay CHF loan: ${chfBorrowed.toFixed(2)} CHF + ${chfInterestOwed.toFixed(2)} CHF interest = ${totalChfOwed.toFixed(2)} CHF</li>
                        <li>4. CHF debt in USD terms at forward rate (${chf.forward}): $${chfRepaymentInUsd.toFixed(2)}</li>
                        <li>5. Net profit: $${nokToUsdProceeds.toFixed(2)} - $${chfRepaymentInUsd.toFixed(2)} = $${netProfitUsd.toFixed(2)} (${returnPercent.toFixed(2)}%)</li>
                    </ul>
                </div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4>Key Insight</h4>
                <p>This hedged carry trade captures the pure interest rate differential of ${rateDifferential.toFixed(2)}% while eliminating currency risk through forward contracts. CHF is an ideal funding currency due to its low interest rate (${chf.interest}%), while NOK offers attractive yields (${nok.interest}%), making this a profitable carry trade strategy.</p>
            </div>
        `;
        root.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => new CarryTradeMatrix()); 