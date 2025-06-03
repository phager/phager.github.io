import { useState, useMemo } from 'react';

type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'NOK';

const CarryTradeMatrix = () => {
  // Current interest rates (as of June 2025) - central bank rates
  const interestRates: Record<Currency, number> = {
    'USD': 4.50, // Fed Funds Rate
    'EUR': 2.50, // ECB Deposit Rate
    'JPY': 0.50, // BOJ Policy Rate
    'GBP': 5.00, // Bank of England Base Rate
    'CHF': 0.25, // SNB Policy Rate (after cuts)
    'CAD': 4.25, // Bank of Canada Rate
    'AUD': 4.35, // RBA Cash Rate
    'NOK': 4.50, // Norges Bank Rate
  };

  // Current exchange rates to USD (approximated current market rates)
  const exchangeRates: Record<Currency, number> = {
    'USD': 1.0000,
    'EUR': 1.0850, // EUR/USD
    'JPY': 0.0067, // USD/JPY ≈ 149
    'GBP': 1.2650, // GBP/USD
    'CHF': 1.1200, // USD/CHF ≈ 0.893
    'CAD': 0.7300, // USD/CAD ≈ 1.37
    'AUD': 0.6680, // AUD/USD
    'NOK': 0.0930, // USD/NOK ≈ 10.75
  };

  // 1-year forward rates (market-based, not formula-based)
  const forwardRates: Record<Currency, number> = {
    'USD': 1.0000,
    'EUR': 1.0920, // EUR/USD forward
    'JPY': 0.0069, // USD/JPY forward ≈ 145
    'GBP': 1.2580, // GBP/USD forward
    'CHF': 1.1350, // USD/CHF forward
    'CAD': 0.7250, // USD/CAD forward
    'AUD': 0.6650, // AUD/USD forward
    'NOK': 0.0945, // USD/NOK forward
  };

  const currencies = Object.keys(interestRates) as Currency[];
  const [activeTab, setActiveTab] = useState('unhedged');

  // Calculate carry trade returns
  const calculateCarryReturn = (fundCurrency: Currency, investCurrency: Currency, hedged = false) => {
    if (fundCurrency === investCurrency) return 0;
    
    const fundRate = interestRates[fundCurrency];
    const investRate = interestRates[investCurrency];
    const carryReturn = investRate - fundRate;
    
    if (!hedged) {
      // Unhedged: Include expected FX return
      const spotRate = exchangeRates[investCurrency] / exchangeRates[fundCurrency];
      const forwardRate = forwardRates[investCurrency] / forwardRates[fundCurrency];
      const fxReturn = ((forwardRate / spotRate) - 1) * 100;
      return carryReturn + fxReturn;
    } else {
      // Hedged: Only carry return
      return carryReturn;
    }
  };

  const getColorForValue = (value: number) => {
    const maxAbs = 8; // Maximum expected absolute value for color scaling
    const normalized = Math.max(-1, Math.min(1, value / maxAbs));
    
    if (normalized >= 0) {
      const intensity = Math.floor(normalized * 255);
      return `rgb(${255 - intensity}, 255, ${255 - intensity})`;
    } else {
      const intensity = Math.floor(Math.abs(normalized) * 255);
      return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
    }
  };

  const renderMatrix = (hedged = false) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-gray-100">Fund → Invest</th>
            {currencies.map(investCurrency => (
              <th key={investCurrency} className="border border-gray-300 p-2 bg-gray-100 min-w-[80px]">
                {investCurrency}<br/>
                <span className="text-xs">({interestRates[investCurrency]}%)</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currencies.map(fundCurrency => (
            <tr key={fundCurrency}>
              <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                {fundCurrency}<br/>
                <span className="text-xs">({interestRates[fundCurrency]}%)</span>
              </td>
              {currencies.map(investCurrency => {
                const returnValue = calculateCarryReturn(fundCurrency, investCurrency, hedged);
                return (
                  <td 
                    key={`${fundCurrency}-${investCurrency}`}
                    className="border border-gray-300 p-2 text-center text-sm"
                    style={{ backgroundColor: getColorForValue(returnValue) }}
                  >
                    {fundCurrency === investCurrency ? '-' : `${returnValue.toFixed(2)}%`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Worked example calculation for CHF -> NOK (positive carry trade)
  const workedExample = useMemo(() => {
    const initialUSD = 10000;
    
    // Current exchange rates (USD per unit of foreign currency)
    const chfToUsd = exchangeRates['CHF']; // 1.1200 USD per CHF
    const nokToUsd = exchangeRates['NOK']; // 0.0930 USD per NOK
    
    // Forward rates (USD per unit of foreign currency)  
    const chfToUsdForward = forwardRates['CHF']; // 1.1350 USD per CHF
    const nokToUsdForward = forwardRates['NOK']; // 0.0945 USD per NOK
    
    // Step 1: Borrow CHF (short CHF)
    const chfBorrowed = initialUSD / chfToUsd; // $10,000 ÷ $1.12/CHF = CHF amount
    const chfInterestOwed = chfBorrowed * (interestRates['CHF'] / 100); // 0.25% interest on CHF loan
    const totalChfOwed = chfBorrowed + chfInterestOwed; // Total CHF to repay
    
    // Step 2: Convert borrowed CHF to NOK immediately at spot
    const chfInUsd = chfBorrowed * chfToUsd; // Convert CHF back to USD equivalent
    const nokReceived = chfInUsd / nokToUsd; // Convert USD to NOK
    
    // Step 3: Invest NOK for 1 year
    const nokInterestEarned = nokReceived * (interestRates['NOK'] / 100); // 4.50% interest on NOK
    const totalNokReceived = nokReceived + nokInterestEarned; // Total NOK after 1 year
    
    // Step 4: At year-end, convert back to USD using forward rates
    const nokToUsdProceeds = totalNokReceived * nokToUsdForward; // NOK × (USD/NOK) = USD
    const chfRepaymentInUsd = totalChfOwed * chfToUsdForward; // CHF × (USD/CHF) = USD
    
    // Step 5: Net result
    const netProfitUsd = nokToUsdProceeds - chfRepaymentInUsd;
    const returnPercent = (netProfitUsd / initialUSD) * 100;
    
    return {
      initialUSD: initialUSD.toFixed(2),
      chfBorrowed: chfBorrowed.toFixed(2),
      nokReceived: nokReceived.toFixed(2),
      chfInterestOwed: chfInterestOwed.toFixed(2),
      nokInterestEarned: nokInterestEarned.toFixed(2),
      totalChfOwed: totalChfOwed.toFixed(2),
      totalNokReceived: totalNokReceived.toFixed(2),
      nokToUsdProceeds: nokToUsdProceeds.toFixed(2),
      chfRepaymentInUsd: chfRepaymentInUsd.toFixed(2),
      netProfitUsd: netProfitUsd.toFixed(2),
      returnPercent: returnPercent.toFixed(2),
      chfToUsd: chfToUsd.toFixed(4),
      nokToUsd: nokToUsd.toFixed(4),
      chfToNok: (chfToUsd / nokToUsd).toFixed(4),
      rateDifferential: (interestRates['NOK'] - interestRates['CHF']).toFixed(2)
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Currency Carry Trade Analysis Matrix</h1>
        <p className="text-gray-600">Interest rates and expected returns for major currency pairs</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('unhedged')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'unhedged' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unhedged Returns
        </button>
        <button
          onClick={() => setActiveTab('hedged')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'hedged' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          FX-Hedged Returns
        </button>
        <button
          onClick={() => setActiveTab('example')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'example' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Worked Example
        </button>
      </div>

      {/* Matrix Display */}
      {activeTab === 'unhedged' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Unhedged Carry Trade Returns (%)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Includes both interest rate differential and expected FX movement based on forward rates
          </p>
          {renderMatrix(false)}
        </div>
      )}

      {activeTab === 'hedged' && (
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{color: '#000', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(255,255,255,0.8)'}}>
            FX-Hedged Carry Trade Returns (%)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Pure interest rate differential returns with FX risk hedged using forward contracts
          </p>
          {renderMatrix(true)}
        </div>
      )}

      {activeTab === 'example' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Worked Example: CHF → NOK Carry Trade</h2>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Trade Setup (FX-Hedged)</h3>
            <p className="text-sm text-green-700">
              Starting with $10,000 USD, execute a profitable carry trade by borrowing CHF (0.25% rate) and investing in NOK (4.50% rate).
              Interest rate differential: {workedExample.rateDifferential}%. Use forward contracts to eliminate FX risk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Day 0 - Trade Entry:</h4>
              <div className="space-y-2 text-sm">
                <p><strong>1.</strong> Borrow CHF equivalent to ${workedExample.initialUSD}: {workedExample.chfBorrowed} CHF</p>
                <p><strong>2.</strong> Convert CHF to NOK at spot rate {workedExample.chfToNok}: {workedExample.nokReceived} NOK</p>
                <p><strong>3.</strong> Invest NOK at 4.50% annual interest rate</p>
                <p><strong>4.</strong> Lock in forward rates to hedge FX risk</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Year End - Trade Settlement:</h4>
              <div className="space-y-2 text-sm">
                <p><strong>1.</strong> NOK investment matures: {workedExample.nokReceived} NOK + {workedExample.nokInterestEarned} NOK interest = {workedExample.totalNokReceived} NOK</p>
                <p><strong>2.</strong> Convert NOK to USD at forward rate: ${workedExample.nokToUsdProceeds}</p>
                <p><strong>3.</strong> Repay CHF loan: {workedExample.chfBorrowed} CHF + {workedExample.chfInterestOwed} CHF interest = {workedExample.totalChfOwed} CHF</p>
                <p><strong>4.</strong> CHF debt in USD terms at forward rate: ${workedExample.chfRepaymentInUsd}</p>
                <p><strong>5.</strong> Net profit: ${workedExample.nokToUsdProceeds} - ${workedExample.chfRepaymentInUsd} = ${workedExample.netProfitUsd} ({workedExample.returnPercent}%)</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Key Insight</h4>
            <p className="text-sm text-green-700">
              This hedged carry trade captures the pure interest rate differential of {workedExample.rateDifferential}% 
              while eliminating currency risk through forward contracts. CHF is an ideal funding currency due to its low interest rate (0.25%), 
              while NOK offers attractive yields (4.50%), making this a profitable carry trade strategy.
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Color Legend</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 border"></div>
            <span>Positive Return</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-200 border"></div>
            <span>Negative Return</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border"></div>
            <span>Neutral (Same Currency)</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Returns shown as annual percentage. Fund currency is borrowed (short position), invest currency is purchased (long position).
        </p>
      </div>
    </div>
  );
};

export default CarryTradeMatrix; 