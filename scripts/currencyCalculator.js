export class CurrencyCalculator {
    static calculateCarryTradeRate(fromCur, toCur, activeTab) {
        if (fromCur.code === toCur.code) return 0;

        switch (activeTab) {
            case "Unhedged":
                return toCur.interest - fromCur.interest;
            case "Hedged":
                return this.calculateUsdBasedCarryTradeRate(fromCur, toCur);
            case "Forward":
                return this.calculateForwardPremium(fromCur, toCur);
            default:
                return 0;
        }
    }

    static calculateForwardPremium(fromCur, toCur) {
        const spotCross = toCur.spot / fromCur.spot;
        const fwdCross = toCur.forward / fromCur.forward;
        return (fwdCross / spotCross - 1) * 100;
    }

    static calculateUsdBasedCarryTradeRate(fromCur, toCur) {
        const initialUSD = 10000;

        // Step 1: Convert USD to funding currency at spot
        const fundAmount = initialUSD / fromCur.spot;

        // Step 2: Convert funding currency to invest currency at cross spot
        const investAmount = fundAmount * (fromCur.spot / toCur.spot);

        // Step 3: Invest at invest rate
        const investInterest = investAmount * (toCur.interest / 100);
        const totalInvest = investAmount + investInterest;

        // Step 4: Convert invest currency to USD at forward
        const proceedsUSD = totalInvest * toCur.forward;

        // Step 5: Repay funding loan + interest at forward
        const fundInterest = fundAmount * (fromCur.interest / 100);
        const totalFundOwed = fundAmount + fundInterest;
        const fundRepaymentUSD = totalFundOwed * fromCur.forward;

        // Step 6: Net profit as % of initial USD
        const netProfit = proceedsUSD - fundRepaymentUSD;
        return (netProfit / initialUSD) * 100;
    }

    static calculateExampleTrade(fromCur, toCur, initialUSD = 10000) {
        // Step 1: Borrow funding currency equivalent to initial USD
        const fundBorrowed = initialUSD / fromCur.spot;

        // Step 2: Convert to invest currency at spot
        const investReceived = fundBorrowed * (fromCur.spot / toCur.spot);

        // Step 3: Invest at invest rate
        const investInterestEarned = investReceived * (toCur.interest / 100);
        const totalInvestReceived = investReceived + investInterestEarned;

        // Step 4: Convert invest currency to USD at forward
        const investToUsdProceeds = totalInvestReceived * toCur.forward;

        // Step 5: Repay funding loan + interest
        const fundInterestOwed = fundBorrowed * (fromCur.interest / 100);
        const totalFundOwed = fundBorrowed + fundInterestOwed;
        const fundRepaymentInUsd = totalFundOwed * fromCur.forward;

        // Step 6: Calculate net profit
        const netProfitUsd = investToUsdProceeds - fundRepaymentInUsd;
        const returnPercent = (netProfitUsd / initialUSD) * 100;
        const rateDifferential = toCur.interest - fromCur.interest;

        return {
            fundBorrowed,
            investReceived,
            investInterestEarned,
            totalInvestReceived,
            investToUsdProceeds,
            fundInterestOwed,
            totalFundOwed,
            fundRepaymentInUsd,
            netProfitUsd,
            returnPercent,
            rateDifferential,
        };
    }
}
