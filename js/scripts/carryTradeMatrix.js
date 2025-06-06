import { DOMUtils } from "./domUtils.js";
import { CurrencyCalculator } from "./currencyCalculator.js";
import { getCurrencies, TABS, TAB_EXPLANATIONS, API_CONFIG } from "./currencyConfig.js";

export class CarryTradeMatrix {
    constructor() {
        this.currencies = [];
        this.tabs = TABS;
        this.activeTab = "Summary";
        this.initialize();
    }

    async initialize() {
        try {
            await this.fetchRatesFromAPI();
            this.render();
        } catch (error) {
            console.error("Failed to initialize:", error);
            // Show error message to user
            const root = document.getElementById("root");
            root.innerHTML =
                '<div class="error">Failed to load currency data. Please try again later.</div>';
        }
    }

    async fetchRatesFromAPI() {
        try {
            // Fetch spot rates from Alpha Vantage
            const spotRates = {};
            for (const currency of API_CONFIG.CURRENCIES) {
                if (currency === "USD") continue;

                const response = await fetch(
                    `${API_CONFIG.BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=${currency}&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`,
                );
                const data = await response.json();

                if (data["Realtime Currency Exchange Rate"]) {
                    let rate = parseFloat(
                        data["Realtime Currency Exchange Rate"]["5. Exchange Rate"],
                    );
                    // --- Normalize all rates to USD/X ---
                    // Alpha Vantage returns USD/JPY (market convention), which is correct for us.
                    // If you ever fetch X/USD, invert it here. For now, all are USD/X.
                    // If you add a currency where the API returns X/USD, use: rate = 1 / rate;
                    spotRates[currency] = rate;
                }
            }

            // Get base currency data
            const baseCurrencies = await getCurrencies();

            // Update spot rates with real data
            this.currencies = baseCurrencies.map((currency) => {
                if (currency.code === "USD") {
                    return currency;
                }
                return {
                    ...currency,
                    spot: spotRates[currency.code] || currency.spot,
                    // Forward rates would need a separate API call to get 1-year forward rates
                    // For now, we'll use the existing forward rates
                };
            });

            // Update last updated timestamp
            const lastUpdated = document.getElementById("last-updated");
            if (lastUpdated) {
                lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
            }

            // Schedule next update in 5 minutes
            setTimeout(() => this.fetchRatesFromAPI(), 5 * 60 * 1000);
        } catch (error) {
            console.error("Error fetching rates:", error);
            throw error;
        }
    }

    render() {
        const root = document.getElementById("root");
        root.innerHTML = "";
        this.renderTabs(root);
        this.renderTabExplanation(root);
        this.renderActiveTab(root);
    }

    renderTabs(root) {
        const tabsContainer = DOMUtils.createContainer("tabs");
        this.tabs.forEach((tab) => {
            const button = DOMUtils.createButton(
                tab + (tab !== "Example" && tab !== "Summary" && tab !== "Extremes" ? " (%)" : ""),
                this.activeTab === tab ? "active" : "",
                () => {
                    this.activeTab = tab;
                    this.render();
                },
            );
            button.dataset.tab = tab;
            tabsContainer.appendChild(button);
        });
        root.appendChild(tabsContainer);
    }

    renderTabExplanation(root) {
        const explanation = DOMUtils.createElement(
            "div",
            "tab-explanation",
            TAB_EXPLANATIONS[this.activeTab],
        );
        explanation.style.marginBottom = "1.5em";
        root.appendChild(explanation);
    }

    renderActiveTab(root) {
        switch (this.activeTab) {
            case "Example":
                this.renderExample(root);
                break;
            case "Summary":
                this.renderSummary(root);
                break;
            case "Extremes":
                this.renderExtremes(root);
                break;
            default:
                this.renderMatrix(root);
        }
    }

    renderMatrix(root) {
        const { table, thead, tbody } = DOMUtils.createTable("carry-trade-matrix");

        // Header rows
        const axisRow = DOMUtils.createTableRow(
            [
                { text: "", scope: "col", className: "empty" },
                { text: "Invest", colSpan: this.currencies.length, style: { textAlign: "center" } },
            ],
            true,
        );

        const headerCells = [{ text: "Fund", scope: "col", className: "vertical-header" }];
        this.currencies.forEach((cur) => {
            headerCells.push({ text: cur.code, scope: "col" });
        });
        const headerRow = DOMUtils.createTableRow(headerCells, true);

        thead.appendChild(axisRow);
        thead.appendChild(headerRow);

        // Body
        this.currencies.forEach((fromCur) => {
            const cells = [{ text: fromCur.code, scope: "row" }];
            this.currencies.forEach((toCur) => {
                if (fromCur.code === toCur.code) {
                    cells.push({ text: "-" });
                } else {
                    const rate = CurrencyCalculator.calculateCarryTradeRate(
                        fromCur,
                        toCur,
                        this.activeTab,
                    );
                    cells.push({
                        text: rate.toFixed(2),
                        className: rate > 0 ? "positive" : "negative",
                    });
                }
            });
            tbody.appendChild(DOMUtils.createTableRow(cells));
        });

        root.appendChild(table);
    }

    renderSummary(root) {
        const { table, thead, tbody } = DOMUtils.createTable("currency-summary-table");

        // Header
        const headers = [
            "Currency",
            "Interest (%)",
            "Spot (USD/X)",
            "Forward (USD/X)",
            "Spot (X/USD)",
            "Forward (X/USD)",
        ];
        thead.appendChild(
            DOMUtils.createTableRow(
                headers.map((h) => ({ text: h })),
                true,
            ),
        );

        // Body
        this.currencies.forEach((cur) => {
            const cells = [
                { text: cur.code },
                { text: cur.interest.toFixed(2) },
                { text: cur.spot.toFixed(4) },
                { text: cur.forward.toFixed(4) },
            ];

            if (cur.code === "USD") {
                cells.push({ text: "-" }, { text: "-" });
            } else {
                cells.push(
                    { text: (1 / cur.spot).toFixed(4) },
                    { text: (1 / cur.forward).toFixed(4) },
                );
            }

            tbody.appendChild(DOMUtils.createTableRow(cells));
        });

        root.appendChild(table);
    }

    renderExtremes(root) {
        const pairs = [];
        // Create all possible pairs and keep only the positive return version
        for (let i = 0; i < this.currencies.length; i++) {
            for (let j = 0; j < this.currencies.length; j++) {
                if (i === j) continue; // Skip same currency pairs
                const fromCur = this.currencies[i];
                const toCur = this.currencies[j];
                const rate = CurrencyCalculator.calculateUsdBasedCarryTradeRate(fromCur, toCur);
                // Only add the pair if it has a positive return
                if (rate > 0) {
                    pairs.push({ from: fromCur.code, to: toCur.code, rate });
                }
            }
        }

        pairs.sort((a, b) => b.rate - a.rate);

        const { table, thead, tbody } = DOMUtils.createTable("top-bottom-table");

        // Header
        thead.appendChild(
            DOMUtils.createTableRow(
                ["Rank", "Pair", "Return (%)"].map((h) => ({ text: h })),
                true,
            ),
        );

        // All pairs
        pairs.forEach((pair, index) => {
            tbody.appendChild(
                DOMUtils.createTableRow([
                    { text: (index + 1).toString() },
                    { text: `${pair.from} / ${pair.to}` },
                    {
                        text: pair.rate.toFixed(2),
                        className: "positive",
                    },
                ]),
            );
        });

        root.appendChild(table);
    }

    renderExample(root) {
        const chf = this.currencies.find((c) => c.code === "CHF");
        const nok = this.currencies.find((c) => c.code === "NOK");
        const initialUSD = 10000;

        const result = CurrencyCalculator.calculateExampleTrade(chf, nok, initialUSD);

        const container = DOMUtils.createContainer("worked-example");
        container.innerHTML = `
            <h2>Worked Example: CHF → NOK Carry Trade (FX-Hedged)</h2>
            <div class="bg-green-50 p-4 rounded-lg">
                <h3>Trade Setup (FX-Hedged)</h3>
                <p>Starting with $${initialUSD.toLocaleString()}, borrow CHF (${chf.interest}% rate) and invest in NOK (${nok.interest}% rate).<br>
                Interest rate differential: ${result.rateDifferential.toFixed(2)}%. Use forward contracts to eliminate FX risk.</p>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4>Day 0 - Trade Entry:</h4>
                    <ul>
                        <li>1. Borrow CHF equivalent to $${initialUSD}: ${result.fundBorrowed.toFixed(2)} CHF</li>
                        <li>2. Convert CHF to NOK at spot rate (${(nok.spot / chf.spot).toFixed(4)}): ${result.investReceived.toFixed(2)} NOK</li>
                        <li>3. Invest NOK at ${nok.interest}% annual interest rate</li>
                        <li>4. Lock in forward rates to hedge FX risk</li>
                    </ul>
                </div>
                <div>
                    <h4>Year End - Trade Settlement:</h4>
                    <ul>
                        <li>1. NOK investment matures: ${result.investReceived.toFixed(2)} NOK + ${result.investInterestEarned.toFixed(2)} NOK interest = ${result.totalInvestReceived.toFixed(2)} NOK</li>
                        <li>2. Convert NOK to USD at forward rate (${nok.forward}): $${result.investToUsdProceeds.toFixed(2)}</li>
                        <li>3. Repay CHF loan: ${result.fundBorrowed.toFixed(2)} CHF + ${result.fundInterestOwed.toFixed(2)} CHF interest = ${result.totalFundOwed.toFixed(2)} CHF</li>
                        <li>4. CHF debt in USD terms at forward rate (${chf.forward}): $${result.fundRepaymentInUsd.toFixed(2)}</li>
                        <li>5. Net profit: $${result.investToUsdProceeds.toFixed(2)} - $${result.fundRepaymentInUsd.toFixed(2)} = $${result.netProfitUsd.toFixed(2)} (${result.returnPercent.toFixed(2)}%)</li>
                    </ul>
                </div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <h4>Key Insight</h4>
                <p>This hedged carry trade captures the pure interest rate differential of ${result.rateDifferential.toFixed(2)}% while eliminating currency risk through forward contracts. CHF is an ideal funding currency due to its low interest rate (${chf.interest}%), while NOK offers attractive yields (${nok.interest}%), making this a profitable carry trade strategy.</p>
            </div>
        `;
        root.appendChild(container);
    }
}

document.addEventListener("DOMContentLoaded", () => new CarryTradeMatrix());
