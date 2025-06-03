import { DOMUtils } from "./domUtils.js";
import { CurrencyCalculator } from "./currencyCalculator.js";
import { CURRENCIES, TABS, TAB_EXPLANATIONS } from "./currencyConfig.js";

export class CarryTradeMatrix {
    constructor() {
        this.currencies = CURRENCIES;
        this.tabs = TABS;
        this.activeTab = "Summary";
        this.render();
    }

    // Placeholder for future API integration
    async fetchRatesFromAPI() {
        // Example: fetch rates and update this.currencies
        // await fetch('...');
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
        this.currencies.forEach((fromCur) => {
            this.currencies.forEach((toCur) => {
                if (fromCur.code !== toCur.code) {
                    const rate = CurrencyCalculator.calculateUsdBasedCarryTradeRate(fromCur, toCur);
                    pairs.push({ from: fromCur.code, to: toCur.code, rate });
                }
            });
        });

        pairs.sort((a, b) => b.rate - a.rate);

        const { table, thead, tbody } = DOMUtils.createTable("top-bottom-table");

        // Header
        thead.appendChild(
            DOMUtils.createTableRow(
                ["Rank", "Pair", "Return (%)"].map((h) => ({ text: h })),
                true,
            ),
        );

        // Top 5
        for (let i = 0; i < 5; i++) {
            tbody.appendChild(
                DOMUtils.createTableRow([
                    { text: (i + 1).toString() },
                    { text: `${pairs[i].from} / ${pairs[i].to}` },
                    { text: pairs[i].rate.toFixed(2), className: "positive" },
                ]),
            );
        }

        // Ellipsis
        tbody.appendChild(
            DOMUtils.createTableRow([{ text: "..." }, { text: "..." }, { text: "..." }]),
        );

        // Bottom 5
        for (let i = pairs.length - 5; i < pairs.length; i++) {
            tbody.appendChild(
                DOMUtils.createTableRow([
                    { text: (i + 1).toString() },
                    { text: `${pairs[i].from} / ${pairs[i].to}` },
                    { text: pairs[i].rate.toFixed(2), className: "negative" },
                ]),
            );
        }

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
