// All inputs in INR, rates as decimals (e.g. 0.12 = 12%)

export function futureValue(monthlyInvestment, annualReturn, years) {
  const r = annualReturn / 12;
  const n = years * 12;
  if (r === 0) return monthlyInvestment * n;
  return monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);
}

export function inflationAdjustedAmount(amountToday, inflation, years) {
  return amountToday * Math.pow(1 + inflation, years);
}

/**
 * Estimate required corpus for retirement.
 * - targetMonthlyToday: target monthly income in today's rupees
 * - inflation: expected inflation till retirement (e.g. 0.06)
 * - postRetReturn: expected annual return during retirement (e.g. 0.08)
 * - yearsToRetire
 * - yearsInRetirement (e.g. 25–30)
 */
export function calculateRequiredCorpus({
  targetMonthlyToday,
  inflation = 0.06,
  postRetReturn = 0.08,
  yearsToRetire,
  yearsInRetirement = 25,
}) {
  const monthlyAtRetirement = inflationAdjustedAmount(
    targetMonthlyToday,
    inflation,
    yearsToRetire
  );
  const r = postRetReturn / 12;
  const n = yearsInRetirement * 12;

  // Present value of annuity: income stream in retirement
  const requiredCorpus =
    monthlyAtRetirement * ((1 - Math.pow(1 + r, -n)) / r);

  return {
    monthlyAtRetirement,
    requiredCorpus,
  };
}

/**
 * Estimate future corpus based on:
 * - current corpus (lumpsum)
 * - monthly investment
 * - annual return
 */
export function estimateFutureCorpus({
  currentCorpus = 0,
  monthlyInvestment,
  annualReturn = 0.12,
  yearsToRetire,
}) {
  const fvContributions = futureValue(monthlyInvestment, annualReturn, yearsToRetire);
  const fvCurrent = currentCorpus * Math.pow(1 + annualReturn, yearsToRetire);
  return fvContributions + fvCurrent;
}

/**
 * Suggest a risk profile based on:
 * - age
 * - yearsToRetire
 * - riskComfort: 'low' | 'medium' | 'high'
 */
export function suggestRiskProfile({ age, yearsToRetire, riskComfort }) {
  if (riskComfort === "high" && yearsToRetire >= 20) {
    return {
      label: "Aggressive",
      equity: 0.75,
      debt: 0.20,
      others: 0.05,
      description:
        "Higher equity allocation via diversified equity mutual funds, index funds and small exposure to mid/small-cap funds.",
    };
  }

  if (riskComfort === "low" || yearsToRetire <= 10) {
    return {
      label: "Conservative",
      equity: 0.35,
      debt: 0.55,
      others: 0.10,
      description:
        "Focus on safer options like high-quality debt funds, FDs, PPF, NPS with limited equity exposure.",
    };
  }

  return {
    label: "Balanced",
    equity: 0.55,
    debt: 0.40,
    others: 0.05,
    description:
      "Blend of equity mutual funds / index funds with good allocation to debt funds, PPF, EPF and NPS.",
  };
}

/**
 * Simple monthly budget suggestion.
 */
export function buildBudget({ netIncome, targetSavingsRatio = 0.3 }) {
  const invest = netIncome * targetSavingsRatio;
  const needs = netIncome * 0.5;
  const wants = netIncome - invest - needs;

  return {
    invest: Math.round(invest),
    needs: Math.round(needs),
    wants: Math.round(wants),
  };
}
