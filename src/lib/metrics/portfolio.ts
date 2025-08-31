interface Holding {
  symbol: string;
  value: number;
  change24h?: number;
}

interface PortfolioMetrics {
  totalValue: number;
  avgChange24h: number;
  biggestMover: {
    symbol: string;
    change24h: number;
  } | null;
  dominance: {
    symbol: string;
    share: number;
  } | null;
  hhi: number;
  stablecoinExposure: number;
}

const STABLECOINS = ['USDT', 'USDC', 'DAI', 'FDUSD', 'TUSD', 'BUSD', 'UST', 'FRAX'];

export function computeMetrics(holdings: Holding[]): PortfolioMetrics {
  if (!holdings || holdings.length === 0) {
    return {
      totalValue: 0,
      avgChange24h: 0,
      biggestMover: null,
      dominance: null,
      hhi: 0,
      stablecoinExposure: 0
    };
  }

  // Calculate total value
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  // Calculate average 24h change (weighted by value)
  let avgChange24h = 0;
  if (totalValue > 0) {
    const weightedChange = holdings.reduce((sum, holding) => {
      const weight = holding.value / totalValue;
      const change = holding.change24h || 0;
      return sum + (change * weight);
    }, 0);
    avgChange24h = Math.round(weightedChange * 10) / 10;
  }

  // Find biggest mover (by absolute percentage change)
  let biggestMover: { symbol: string; change24h: number } | null = null;
  if (holdings.length > 0) {
    const mover = holdings
      .filter(h => h.change24h !== undefined)
      .reduce((max, current) => {
        const maxAbs = Math.abs(max?.change24h || 0);
        const currentAbs = Math.abs(current.change24h || 0);
        return currentAbs > maxAbs ? current : max;
      }, holdings[0]);

    if (mover && mover.change24h !== undefined) {
      biggestMover = {
        symbol: mover.symbol,
        change24h: Math.round(mover.change24h * 10) / 10
      };
    }
  }

  // Calculate dominance (largest holding by value)
  let dominance: { symbol: string; share: number } | null = null;
  if (totalValue > 0) {
    const largest = holdings.reduce((max, current) => 
      current.value > max.value ? current : max
    );
    dominance = {
      symbol: largest.symbol,
      share: Math.round((largest.value / totalValue) * 1000) / 1000
    };
  }

  // Calculate Herfindahl-Hirschman Index (HHI) for concentration
  let hhi = 0;
  if (totalValue > 0) {
    hhi = holdings.reduce((sum, holding) => {
      const share = holding.value / totalValue;
      return sum + (share * share);
    }, 0);
    hhi = Math.round(hhi * 10000) / 10000;
  }

  // Calculate stablecoin exposure
  let stablecoinExposure = 0;
  if (totalValue > 0) {
    const stablecoinValue = holdings
      .filter(h => STABLECOINS.includes(h.symbol.toUpperCase()))
      .reduce((sum, h) => sum + h.value, 0);
    stablecoinExposure = Math.round((stablecoinValue / totalValue) * 1000) / 1000;
  }

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    avgChange24h,
    biggestMover,
    dominance,
    hhi,
    stablecoinExposure
  };
}
