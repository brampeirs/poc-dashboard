import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const netWorthData = [
  { month: "2024-12", label: "2024", value: 258000 },
  { month: "2025-01", label: "2025", value: 260000 },
  { month: "2025-02", label: "2025", value: 262000 },
  { month: "2025-03", label: "2025", value: 264000 },
  { month: "2025-04", label: "2025", value: 266000 },
  { month: "2025-05", label: "2025", value: 268000 },
  { month: "2025-06", label: "2025", value: 270000 },
  { month: "2025-07", label: "2025", value: 272000 },
  { month: "2025-08", label: "2025", value: 274000 },
  { month: "2025-09", label: "2025", value: 276000 },
  { month: "2025-10", label: "2025", value: 278000 },
  { month: "2025-11", label: "2025", value: 280000 },
];

type MonthNote = {
  month: string;
  note: string;
};

const monthNotes: MonthNote[] = [
  { month: "2025-01", note: "Bonus ontvangen van werkgever" },
  { month: "2025-03", note: "Auto reparatie (€2.500)" },
  { month: "2025-06", note: "Vakantie naar Spanje" },
  { month: "2025-09", note: "Nieuwe laptop gekocht" },
];

const accountTypeData = [
  { name: "Zicht", value: 15000 },
  { name: "Spaar", value: 120000 },
  { name: "Beleggingen", value: 150000 },
  { name: "Cash", value: 12100 },
];

const bankDistributionData = [
  { name: "KBC", value: 85000 },
  { name: "Belfius", value: 65000 },
  { name: "ING", value: 42000 },
  { name: "Argenta", value: 30000 },
];

type FixedCost = {
  name: string;
  amount: number; // bedrag per periode
  frequency: "monthly" | "quarterly" | "yearly";
  account?: string;
  kind: "vast" | "variabel";
};

const initialFixedCosts: FixedCost[] = [
  {
    name: "Hypothecaire lening",
    amount: 1000,
    frequency: "monthly",
    account: "KBC Woning",
    kind: "vast",
  },
  {
    name: "Elektriciteit",
    amount: 160,
    frequency: "monthly",
    account: "DOMICILIËRING",
    kind: "variabel",
  },
  {
    name: "Water",
    amount: 120,
    frequency: "yearly",
    account: "Zichtrekening",
    kind: "variabel",
  },
  {
    name: "Internet / GSM",
    amount: 80,
    frequency: "monthly",
    account: "Zichtrekening",
    kind: "vast",
  },
];

const accountTypeColors = ["#0ea5e9", "#6366f1", "#22c55e", "#f59e0b"];
const bankDistributionColors = ["#334155", "#2563eb", "#f97316", "#10b981"];

const euro = (n: number) =>
  n.toLocaleString("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

type Range = "all" | "ytd" | "1y" | "6m";

const rangeLabels: Record<Range, string> = {
  all: "Alles",
  ytd: "YTD",
  "1y": "1J",
  "6m": "6M",
};

const monthlyFromFixedCost = (cost: FixedCost): number => {
  switch (cost.frequency) {
    case "monthly":
      return cost.amount;
    case "quarterly":
      return cost.amount / 3;
    case "yearly":
      return cost.amount / 12;
    default:
      return cost.amount;
  }
};

// Cashflow Card Component with expand/collapse
const CashflowCard: React.FC<{
  estimatedMonthlyIncome: number;
  avgMonthlySavings: number;
  avgMonthlySpending: number;
  totalFixedMonthlyCosts: number;
  otherCosts: number;
  fixedPctOfCosts: number;
  otherPctOfCosts: number;
  savingsPctOfIncome: number;
  costsPctOfIncome: number;
}> = ({
  estimatedMonthlyIncome,
  avgMonthlySavings,
  avgMonthlySpending,
  totalFixedMonthlyCosts,
  otherCosts,
  fixedPctOfCosts,
  otherPctOfCosts,
  savingsPctOfIncome,
  costsPctOfIncome,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-slate-800">Maandelijkse cashflow</CardTitle>
            <CardDescription className="text-xs text-slate-500">Samenvatting van inkomen, sparen en totale kosten.</CardDescription>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={isExpanded ? "Inklappen" : "Uitklappen"}
          >
            <svg
              className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-1 space-y-2 text-xs flex-1">
        {/* Always visible: main summary */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Inkomen</span>
          <span className="font-medium text-slate-900">{euro(estimatedMonthlyIncome)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Sparen</span>
          <span className="font-medium text-slate-900">{euro(avgMonthlySavings)}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-500">Totale kosten</span>
          <span className="font-medium text-slate-900">{euro(avgMonthlySpending)}</span>
        </div>

        {/* Expandable details */}
        {isExpanded && (
          <>
            <div className="pl-2 space-y-0.5 text-[11px] pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vaste</span>
                <span className="text-slate-700">
                  {euro(totalFixedMonthlyCosts)} ({fixedPctOfCosts.toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overige</span>
                <span className="text-slate-700">
                  {euro(Math.max(0, otherCosts))} ({otherPctOfCosts.toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Balk: sparen vs kosten als % van inkomen */}
            <div className="space-y-0.5 pt-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Sparen vs kosten</span>
                <span>
                  {savingsPctOfIncome.toFixed(0)}% / {costsPctOfIncome.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${savingsPctOfIncome.toFixed(0)}%` }}
                />
              </div>
            </div>

            {/* Balk: vaste vs overige kosten binnen totale kosten */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Vaste vs overige</span>
                <span>
                  {fixedPctOfCosts.toFixed(0)}% / {otherPctOfCosts.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-400"
                  style={{ width: `${fixedPctOfCosts.toFixed(0)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [range, setRange] = useState<Range>("all");
  const [isNetWorthExpanded, setIsNetWorthExpanded] = useState(false);
  const [estimatedMonthlyIncome, setEstimatedMonthlyIncome] = useState(5000);
  const [yearlySavingsTarget, setYearlySavingsTarget] = useState(10000);
  const [goalAmount, setGoalAmount] = useState(400000);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(initialFixedCosts);
  const [editingCostIndex, setEditingCostIndex] = useState<number | null>(null);
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [newCost, setNewCost] = useState<FixedCost>({
    name: "",
    amount: 0,
    frequency: "monthly",
    kind: "vast",
  });
  const [showFIModal, setShowFIModal] = useState(false);
  const [showTypePercentages, setShowTypePercentages] = useState(false);
  const [showBankPercentages, setShowBankPercentages] = useState(false);
  const [emergencyFundMonths, setEmergencyFundMonths] = useState(6);
  const [isEditingEmergencyFund, setIsEditingEmergencyFund] = useState(false);

  const filteredData = useMemo(() => {
    if (range === "all") return netWorthData;

    const last = netWorthData[netWorthData.length - 1];
    const lastDate = new Date(last.month + "-01");

    const monthsBack = range === "ytd" ? 11 : range === "1y" ? 11 : 5;
    const minDate = new Date(lastDate);
    minDate.setMonth(minDate.getMonth() - monthsBack);

    return netWorthData.filter((d) => {
      const date = new Date(d.month + "-01");
      if (range === "ytd") {
        return date.getFullYear() === lastDate.getFullYear();
      }
      return date >= minDate;
    });
  }, [range]);

  const filteredNotes = useMemo(() => {
    const filteredMonths = new Set(filteredData.map((d) => d.month));
    return monthNotes.filter((note) => filteredMonths.has(note.month));
  }, [filteredData]);

  const currentNetWorth = netWorthData[netWorthData.length - 1].value;
  const previousNetWorth = netWorthData[netWorthData.length - 2].value;
  const delta = currentNetWorth - previousNetWorth;

  // Gemiddeld spaarsaldo - altijd op basis van laatste 12 maanden
  const { avgMonthlySavings, avgYearlySavings } = useMemo(() => {
    if (netWorthData.length < 2) {
      return {
        avgMonthlySavings: 0,
        avgYearlySavings: 0,
      } as const;
    }

    const last = netWorthData[netWorthData.length - 1];
    const lastDate = new Date(last.month + "-01");

    // Altijd laatste 12 maanden
    const fromDate = new Date(lastDate);
    fromDate.setFullYear(fromDate.getFullYear() - 1);

    const points = netWorthData.filter((d) => {
      const date = new Date(d.month + "-01");
      return date >= fromDate && date <= lastDate;
    });

    if (points.length < 2) {
      return {
        avgMonthlySavings: 0,
        avgYearlySavings: 0,
      } as const;
    }

    let totalDelta = 0;
    let periods = 0;

    for (let i = 1; i < points.length; i++) {
      totalDelta += points[i].value - points[i - 1].value;
      periods++;
    }

    const monthly = totalDelta / periods;
    const yearly = monthly * 12;

    return {
      avgMonthlySavings: monthly,
      avgYearlySavings: yearly,
    } as const;
  }, []);

  // ---- FORECAST + TIME-TO-GOAL LOGIC ----
  const projectedBalance12m = currentNetWorth + avgMonthlySavings * 12;
  const projectedGrowth12m = avgMonthlySavings * 12;

  const remainingToGoal = goalAmount - currentNetWorth;
  const goalAlreadyReached = remainingToGoal <= 0;
  const goalReachable = avgMonthlySavings > 0 && !goalAlreadyReached;

  let monthsToGoal: number | null = null;
  let yearsToGoal: number | null = null;
  let goalTargetLabel: string | null = null;

  if (goalReachable) {
    monthsToGoal = remainingToGoal / avgMonthlySavings;
    yearsToGoal = monthsToGoal / 12;

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + Math.ceil(monthsToGoal));

    goalTargetLabel = targetDate.toLocaleDateString("nl-BE", {
      month: "long",
      year: "numeric",
    });
  }

  const lastPoint = netWorthData[netWorthData.length - 1];
  const lastPointYear = new Date(lastPoint.month + "-01").getFullYear();

  const liquidNetWorth = useMemo(() => {
    return accountTypeData
      .filter((acc) => ["Zicht", "Spaar", "Cash"].includes(acc.name))
      .reduce((sum, acc) => sum + acc.value, 0);
  }, []);

  const investmentsNetWorth = useMemo(() => {
    return accountTypeData
      .filter((acc) => acc.name === "Beleggingen")
      .reduce((sum, acc) => sum + acc.value, 0);
  }, []);

  const liquidPct = currentNetWorth > 0 ? (liquidNetWorth / currentNetWorth) * 100 : 0;
  const investmentsPct = currentNetWorth > 0 ? (investmentsNetWorth / currentNetWorth) * 100 : 0;

  const { ytdChange, ytdChangePct } = useMemo(() => {
    const last = netWorthData[netWorthData.length - 1];
    const lastDate = new Date(last.month + "-01");

    const yearStartPoint = netWorthData.find((d) => {
      const date = new Date(d.month + "-01");
      return date.getFullYear() === lastDate.getFullYear();
    });

    if (!yearStartPoint) {
      return { ytdChange: 0, ytdChangePct: 0 };
    }

    const change = last.value - yearStartPoint.value;
    const pct = (change / yearStartPoint.value) * 100;

    return { ytdChange: change, ytdChangePct: pct };
  }, []);

  const savingsStreak = useMemo(() => {
    let streak = 0;
    for (let i = netWorthData.length - 1; i > 0; i--) {
      const diff = netWorthData[i].value - netWorthData[i - 1].value;
      if (diff > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, []);

  // Spaartrend berekening (laatste 12 maanden)
  const savingsTrend = useMemo(() => {
    if (netWorthData.length < 3) {
      return { trend: 0, direction: "stable" as const };
    }

    // Neem laatste 12 maanden (of minder als er niet genoeg data is)
    const last = netWorthData[netWorthData.length - 1];
    const lastDate = new Date(last.month + "-01");
    const fromDate = new Date(lastDate);
    fromDate.setFullYear(fromDate.getFullYear() - 1);

    const points = netWorthData.filter((d) => {
      const date = new Date(d.month + "-01");
      return date >= fromDate && date <= lastDate;
    });

    if (points.length < 3) {
      return { trend: 0, direction: "stable" as const };
    }

    // Bereken maandelijkse deltas
    const deltas: number[] = [];
    for (let i = 1; i < points.length; i++) {
      deltas.push(points[i].value - points[i - 1].value);
    }

    // Simpele lineaire regressie op de deltas
    const n = deltas.length;
    const xMean = (n - 1) / 2;
    const yMean = deltas.reduce((sum, d) => sum + d, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = deltas[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Bepaal richting
    let direction: "improving" | "declining" | "stable";
    if (Math.abs(slope) < 50) {
      direction = "stable";
    } else if (slope > 0) {
      direction = "improving";
    } else {
      direction = "declining";
    }

    return { trend: slope, direction };
  }, []);

  const targetProgress = ytdChange;
  const targetProgressPct = yearlySavingsTarget
    ? Math.max(0, Math.min(100, (targetProgress / yearlySavingsTarget) * 100))
    : 0;

  const totalFixedMonthlyCosts = useMemo(() => {
    return fixedCosts.reduce((sum, cost) => sum + monthlyFromFixedCost(cost), 0);
  }, [fixedCosts]);

  const handleDeleteCost = (index: number) => {
    setFixedCosts(fixedCosts.filter((_, i) => i !== index));
  };

  const handleAddCost = () => {
    if (newCost.name && newCost.amount > 0) {
      setFixedCosts([...fixedCosts, newCost]);
      setNewCost({ name: "", amount: 0, frequency: "monthly", kind: "vast" });
      setIsAddingCost(false);
    }
  };

  const handleUpdateCost = (index: number, updatedCost: FixedCost) => {
    const updated = [...fixedCosts];
    updated[index] = updatedCost;
    setFixedCosts(updated);
    setEditingCostIndex(null);
  };

  const avgMonthlySpending = useMemo(() => {
    return estimatedMonthlyIncome - avgMonthlySavings;
  }, [estimatedMonthlyIncome, avgMonthlySavings]);

  const runwayMonths = avgMonthlySpending > 0 ? liquidNetWorth / avgMonthlySpending : 0;

  // Emergency Fund Status
  const emergencyFundTarget = avgMonthlySpending * emergencyFundMonths;
  const emergencyFundPct = emergencyFundTarget > 0 ? (liquidNetWorth / emergencyFundTarget) * 100 : 0;
  const emergencyFundStatus =
    emergencyFundPct >= 100 ? "excellent" :
    emergencyFundPct >= 75 ? "good" :
    emergencyFundPct >= 50 ? "fair" :
    "insufficient";

  // Financial Independence (4% rule: vermogen / (jaarlijkse uitgaven × 25))
  const yearlySpending = avgMonthlySpending * 12;
  const fiTarget = yearlySpending * 25;
  const fiPct = fiTarget > 0 ? (currentNetWorth / fiTarget) * 100 : 0;

  // Tijd tot FI berekenen
  const remainingToFI = fiTarget - currentNetWorth;
  const monthsToFI = avgMonthlySavings > 0 ? remainingToFI / avgMonthlySavings : 0;
  const yearsToFI = monthsToFI / 12;

  const fiDate = new Date();
  fiDate.setMonth(fiDate.getMonth() + Math.ceil(monthsToFI));
  const fiDateString = fiDate.toLocaleDateString("nl-BE", {
    month: "long",
    year: "numeric",
  });

  const totalCosts = avgMonthlySpending;
  const savingsPctOfIncome = estimatedMonthlyIncome
    ? Math.max(0, Math.min(100, (avgMonthlySavings / estimatedMonthlyIncome) * 100))
    : 0;
  const costsPctOfIncome = Math.max(0, Math.min(100, 100 - savingsPctOfIncome));

  const fixedPctOfCosts = totalCosts
    ? Math.max(0, Math.min(100, (totalFixedMonthlyCosts / totalCosts) * 100))
    : 0;
  const otherCosts = totalCosts - totalFixedMonthlyCosts;
  const otherPctOfCosts = Math.max(0, Math.min(100, 100 - fixedPctOfCosts));

  return (
    <div className="w-full min-h-screen bg-slate-50 px-6 py-8 md:px-10 lg:px-16">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Welkom bij je financiële overzicht.</p>
      </header>

      {/* Top row: total net worth + delta */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
        {/* Totaal vermogen - Expandable */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Totaal Vermogen</CardTitle>
                <CardDescription className="mt-1">Per november 2025</CardDescription>
              </div>
              <button
                onClick={() => setIsNetWorthExpanded(!isNetWorthExpanded)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={isNetWorthExpanded ? "Inklappen" : "Uitklappen"}
              >
                <svg
                  className={cn("w-5 h-5 transition-transform", isNetWorthExpanded && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 flex-1">
            <div className="text-2xl font-semibold text-emerald-500">{euro(currentNetWorth)}</div>

            {isNetWorthExpanded && (
              <>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Liquide middelen</span>
                    <span className="font-medium text-slate-900">
                      {euro(liquidNetWorth)} ({liquidPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Beleggingen</span>
                    <span className="font-medium text-slate-900">
                      {euro(investmentsNetWorth)} ({investmentsPct.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Liquide vs Beleggingen</span>
                    <span>{liquidPct.toFixed(0)}% / {investmentsPct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${liquidPct.toFixed(0)}%` }}
                    />
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${investmentsPct.toFixed(0)}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Verandering t.o.v. vorige maand */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Verandering t.o.v. vorige maand</CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500 leading-relaxed">Netto stijging of daling van je vermogen.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2">
            <div
              className={cn(
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}
            >
              <span className="mr-1">{delta >= 0 ? "↑" : "↓"}</span>
              {euro(Math.abs(delta))}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Op basis van vorige maand.</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings & spending row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        {/* Gemiddeld spaarsaldo */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Gemiddeld spaarsaldo</CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500 leading-relaxed">Op basis van de laatste 12 maanden.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div className="text-xl font-semibold text-slate-900">{euro(avgMonthlySavings)} / maand</div>
            <div className="text-xs text-slate-500 leading-relaxed">≈ {euro(avgYearlySavings)} per jaar</div>
            <p className="text-xs text-slate-500 leading-relaxed">Inclusief alle rekeningen.</p>
          </CardContent>
        </Card>

        {/* Gemiddelde uitgaven per maand */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Gemiddelde uitgaven</CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500 leading-relaxed">Op basis van inkomen minus spaargedrag.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div className="text-xl font-semibold text-slate-900">{euro(avgMonthlySpending)} / maand</div>
            <p className="text-xs text-slate-500 leading-relaxed">Inclusief vaste + variabele uitgaven.</p>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Savings Rate</CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500 leading-relaxed">Percentage van je inkomen dat je spaart.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 flex-1">
            <div className="text-xl font-semibold text-slate-900">{savingsPctOfIncome.toFixed(1)}%</div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  savingsPctOfIncome < 20 ? "bg-rose-500" :
                  savingsPctOfIncome < 40 ? "bg-amber-500" :
                  "bg-emerald-500"
                )}
                style={{ width: `${Math.min(100, savingsPctOfIncome)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {savingsPctOfIncome < 20 && "Probeer meer te sparen"}
              {savingsPctOfIncome >= 20 && savingsPctOfIncome < 40 && "Goed bezig!"}
              {savingsPctOfIncome >= 40 && "Uitstekend spaargedrag! 🎉"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Extra metrics row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-8">
        {/* Runway */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Runway</CardTitle>
            <CardDescription className="text-xs text-slate-500">Hoelang je huidige buffer je kan dragen.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div className="text-xl font-semibold text-slate-900">{runwayMonths.toFixed(1)} maanden</div>
            <p className="text-xs text-slate-500">Op basis van {euro(avgMonthlySpending)} uitgaven per maand.</p>
          </CardContent>
        </Card>

        {/* Geschat inkomen - Editable */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Geschat inkomen</CardTitle>
                <CardDescription className="text-xs text-slate-500">Je totale geschatte maandelijkse inkomsten.</CardDescription>
              </div>
              <button
                onClick={() => setIsEditingIncome(!isEditingIncome)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={isEditingIncome ? "Annuleren" : "Bewerken"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditingIncome ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  )}
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            {isEditingIncome ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={estimatedMonthlyIncome}
                  onChange={(e) => setEstimatedMonthlyIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Geschat inkomen"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingIncome(false)}
                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            ) : (
              <>
                <div className="text-xl font-semibold text-slate-900">{euro(estimatedMonthlyIncome)} / maand</div>
                <p className="text-xs text-slate-500">Optioneel gecombineerd inkomen van Bram &amp; Liesbeth.</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Maandelijkse cashflow */}
        <CashflowCard
          estimatedMonthlyIncome={estimatedMonthlyIncome}
          avgMonthlySavings={avgMonthlySavings}
          avgMonthlySpending={avgMonthlySpending}
          totalFixedMonthlyCosts={totalFixedMonthlyCosts}
          otherCosts={otherCosts}
          fixedPctOfCosts={fixedPctOfCosts}
          otherPctOfCosts={otherPctOfCosts}
          savingsPctOfIncome={savingsPctOfIncome}
          costsPctOfIncome={costsPctOfIncome}
        />

        {/* Netto verandering YTD */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Netto verandering YTD</CardTitle>
            <CardDescription className="text-xs text-slate-500">Sinds 1 januari {lastPointYear}.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div
              className={cn(
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                ytdChange >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}
            >
              <span className="mr-1">{ytdChange >= 0 ? "↑" : "↓"}</span>
              {euro(Math.abs(ytdChange))} ({ytdChangePct.toFixed(1)}%)
            </div>
            <p className="text-xs text-slate-500">Totale wijziging van je vermogen dit jaar.</p>
          </CardContent>
        </Card>

        {/* Savings streak */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Savings streak</CardTitle>
            <CardDescription className="text-xs text-slate-500">Aantal opeenvolgende maanden waarin je vermogen steeg.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div className="text-xl font-semibold text-slate-900">
              {savingsStreak} maand{savingsStreak === 1 ? "" : "en"} op rij
            </div>
            <p className="text-xs text-slate-500">Reset wanneer een maand daalt t.o.v. de vorige.</p>
          </CardContent>
        </Card>

        {/* Spaartrend */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Spaartrend</CardTitle>
            <CardDescription className="text-xs text-slate-500">Evolutie van je spaargedrag over de laatste 12 maanden.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  savingsTrend.direction === "improving" ? "bg-emerald-50 text-emerald-700" :
                  savingsTrend.direction === "declining" ? "bg-rose-50 text-rose-700" :
                  "bg-slate-50 text-slate-700"
                )}
              >
                {savingsTrend.direction === "improving" && "↗ Verbeterend"}
                {savingsTrend.direction === "declining" && "↘ Dalend"}
                {savingsTrend.direction === "stable" && "→ Stabiel"}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {savingsTrend.direction === "improving" && "Je spaargedrag verbetert! Blijf zo doorgaan."}
              {savingsTrend.direction === "declining" && "Je spaargedrag daalt. Probeer meer te sparen."}
              {savingsTrend.direction === "stable" && "Je spaargedrag is consistent."}
            </p>
          </CardContent>
        </Card>

        {/* Jaarlijks spaardoel - Editable */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Jaarlijks spaardoel</CardTitle>
                <CardDescription className="text-xs text-slate-500">Voorbeeld: {euro(yearlySavingsTarget)} in {lastPointYear}.</CardDescription>
              </div>
              <button
                onClick={() => setIsEditingTarget(!isEditingTarget)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={isEditingTarget ? "Annuleren" : "Bewerken"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditingTarget ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  )}
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 flex-1">
            {isEditingTarget ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={yearlySavingsTarget}
                  onChange={(e) => setYearlySavingsTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Jaarlijks spaardoel"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Totaal gespaard YTD</span>
                  <span className="font-medium text-slate-900">{euro(Math.max(0, targetProgress))}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, targetProgressPct)}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={targetProgressPct >= 100 ? "font-medium text-emerald-600" : "text-slate-500"}>
                    {targetProgressPct.toFixed(0)}% behaald
                    {targetProgressPct >= 100 && " 🎉"}
                  </span>
                  <span className="text-slate-500">Doel: {euro(yearlySavingsTarget)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Emergency Fund Status - Editable */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Emergency Fund</CardTitle>
                <CardDescription className="text-xs text-slate-500">Voldoende buffer voor {emergencyFundMonths} maanden uitgaven.</CardDescription>
              </div>
              <button
                onClick={() => setIsEditingEmergencyFund(!isEditingEmergencyFund)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={isEditingEmergencyFund ? "Annuleren" : "Bewerken"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditingEmergencyFund ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  )}
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 flex-1">
            {isEditingEmergencyFund ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-600">Aantal maanden buffer</label>
                <input
                  type="number"
                  value={emergencyFundMonths}
                  onChange={(e) => setEmergencyFundMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Aantal maanden"
                  min="1"
                  max="24"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingEmergencyFund(false)}
                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Liquide middelen</span>
                  <span className="font-medium text-slate-900">{euro(liquidNetWorth)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      emergencyFundStatus === "excellent" ? "bg-emerald-500" :
                      emergencyFundStatus === "good" ? "bg-blue-500" :
                      emergencyFundStatus === "fair" ? "bg-amber-500" :
                      "bg-rose-500"
                    )}
                    style={{ width: `${Math.min(100, emergencyFundPct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    "font-medium",
                    emergencyFundStatus === "excellent" ? "text-emerald-600" :
                    emergencyFundStatus === "good" ? "text-blue-600" :
                    emergencyFundStatus === "fair" ? "text-amber-600" :
                    "text-rose-600"
                  )}>
                    {emergencyFundStatus === "excellent" && "Uitstekend 🎉"}
                    {emergencyFundStatus === "good" && "Goed ✓"}
                    {emergencyFundStatus === "fair" && "Voldoende"}
                    {emergencyFundStatus === "insufficient" && "Onvoldoende"}
                  </span>
                  <span className="text-slate-500">Doel: {euro(emergencyFundTarget)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Projectie 12 maanden */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Projectie 12 maanden</CardTitle>
            <CardDescription className="text-xs text-slate-500">Op basis van je huidige gemiddelde spaargedrag (laatste 12 maanden).</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 flex-1">
            <div className="text-xl font-semibold text-slate-900">{euro(projectedBalance12m)}</div>
            <p className="text-xs text-slate-500">≈ {euro(projectedGrowth12m)} groei t.o.v. nu in één jaar.</p>
          </CardContent>
        </Card>

        {/* Financial Independence */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-slate-800">Financial Independence</CardTitle>
                  <button
                    onClick={() => setShowFIModal(true)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Meer informatie"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <CardDescription className="text-xs text-slate-500">Op basis van de 4% regel (25× jaarlijkse uitgaven).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 flex-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500">Voortgang</span>
              <span className="font-medium text-slate-900">{fiPct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, fiPct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Huidig: {euro(currentNetWorth)}</span>
              <span>FI: {euro(fiTarget)}</span>
            </div>
            {fiPct < 100 && avgMonthlySavings > 0 && monthsToFI > 0 && (
              <p className="text-xs text-slate-600 pt-1">
                Nog ongeveer <span className="font-medium text-slate-900">{yearsToFI.toFixed(1)} jaar</span> ({Math.ceil(monthsToFI)} maanden).
                <br />
                <span className="text-slate-500">Geschat rond {fiDateString} bij gelijk spaartempo.</span>
              </p>
            )}
            {fiPct >= 100 && (
              <p className="text-xs text-emerald-600 font-medium pt-1">
                Je bent financieel onafhankelijk! 🎉
              </p>
            )}
            {fiPct < 100 && avgMonthlySavings <= 0 && (
              <p className="text-xs text-slate-500 pt-1">
                Begin met sparen om je FI-doel te bereiken.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tijd tot doelvermogen */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Tijd tot doel</CardTitle>
                <CardDescription className="text-xs text-slate-500">Doelvermogen: {euro(goalAmount)}.</CardDescription>
              </div>
              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={isEditingGoal ? "Annuleren" : "Bewerken"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditingGoal ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  )}
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 text-xs flex-1">
            {isEditingGoal ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-600">Doelvermogen</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doelvermogen"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            ) : (
              <>
            {goalAlreadyReached ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500">Voortgang</span>
                  <span className="font-medium text-emerald-600">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: "100%" }} />
                </div>
                <p className="text-emerald-600 font-medium">Je hebt je doel al bereikt! 🎉</p>
                <p className="text-slate-500">Huidig vermogen is hoger dan {euro(goalAmount)}.</p>
              </>
            ) : !goalReachable ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500">Voortgang</span>
                  <span className="font-medium text-slate-900">{((currentNetWorth / goalAmount) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-400 transition-all"
                    style={{ width: `${Math.min(100, (currentNetWorth / goalAmount) * 100)}%` }}
                  />
                </div>
                <p className="text-slate-900 font-medium">
                  Huidig spaartempo is onvoldoende om het doel te bereiken.
                </p>
                <p className="text-slate-500">
                  Verhoog je spaargedrag of verlaag je doel om een realistische inschatting te krijgen.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500">Voortgang</span>
                  <span className="font-medium text-slate-900">{((currentNetWorth / goalAmount) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, (currentNetWorth / goalAmount) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Huidig: {euro(currentNetWorth)}</span>
                  <span>Doel: {euro(goalAmount)}</span>
                </div>
                <p className="text-slate-900 font-medium">
                  Nog ongeveer {monthsToGoal?.toFixed(1)} maanden ({yearsToGoal?.toFixed(1)} jaar).
                </p>
                {goalTargetLabel && (
                  <p className="text-slate-500">
                    Geschat rond {goalTargetLabel.toLowerCase()} bij gelijk spaartempo.
                  </p>
                )}
              </>
            )}
            </>
            )}
          </CardContent>
        </Card>

        {/* Verdeling per type */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Verdeling per type</CardTitle>
                <CardDescription className="text-xs text-slate-500">Hoe je vermogen nu verdeeld is.</CardDescription>
              </div>
              <button
                onClick={() => setShowTypePercentages(!showTypePercentages)}
                className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {showTypePercentages ? "€" : "%"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 flex items-center gap-4 flex-1">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountTypeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
                  >
                    {accountTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={accountTypeColors[index % accountTypeColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {accountTypeData.map((item, index) => {
                const percentage = currentNetWorth > 0 ? (item.value / currentNetWorth) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: accountTypeColors[index % accountTypeColors.length] }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {showTypePercentages ? `${percentage.toFixed(1)}%` : euro(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Verdeling per bank */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-slate-800">Verdeling per bank</CardTitle>
                <CardDescription className="text-xs text-slate-500">Hoe je vermogen over banken gespreid is.</CardDescription>
              </div>
              <button
                onClick={() => setShowBankPercentages(!showBankPercentages)}
                className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {showBankPercentages ? "€" : "%"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 flex items-center gap-4 flex-1">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bankDistributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
                  >
                    {bankDistributionData.map((entry, index) => (
                      <Cell key={entry.name} fill={bankDistributionColors[index % bankDistributionColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {bankDistributionData.map((item, index) => {
                const percentage = currentNetWorth > 0 ? (item.value / currentNetWorth) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: bankDistributionColors[index % bankDistributionColors.length] }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {showBankPercentages ? `${percentage.toFixed(1)}%` : euro(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vaste kosten detail + UX flow */}
      <div className="mt-8">
      <Card>
        <CardHeader className="pb-3">
          {/* TODO: make button trigger actual add-cost flow later */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-medium text-slate-800">
                Geschatte vaste kosten
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Geef hier een inschatting van je terugkerende vaste kosten (bv. lening, energie, water, Netflix, ...). Dit is bedoeld
                als extra inzicht en hoeft niet tot op de euro juist te zijn.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsAddingCost(true)}>
              Nieuwe vaste kost
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-xs">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-slate-500">Geschat totaal vaste kosten / maand</span>
            <span className="text-sm font-semibold text-slate-900">{euro(totalFixedMonthlyCosts)}</span>
          </div>

          {fixedCosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
              <p className="text-sm font-medium text-slate-900 mb-1">Nog geen vaste kosten toegevoegd.</p>
              <p className="text-xs text-slate-500 mb-4 max-w-md">
                Voeg je belangrijkste terugkerende kosten toe om een realistischer beeld te krijgen van je maandelijkse ruimte.
              </p>
              <Button size="sm" variant="outline" onClick={() => setIsAddingCost(true)}>
                Nieuwe vaste kost
              </Button>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden overflow-x-auto">
              <div className="grid min-w-[600px] grid-cols-[2fr_1fr_1fr_1fr_auto] bg-slate-50 px-3 py-2 font-medium text-[11px] text-slate-500 uppercase tracking-wide">
                <span>Kost</span>
                <span className="text-right">Bedrag</span>
                <span className="text-right">Frequentie</span>
                <span className="text-right">Maandelijks</span>
                <span className="text-right">Acties</span>
              </div>
              <div className="max-h-[260px] overflow-auto">
                {fixedCosts.map((cost, idx) => (
                  <div
                    key={cost.name + idx}
                    className="grid min-w-[600px] grid-cols-[2fr_1fr_1fr_1fr_auto] px-3 py-2 border-t border-slate-100 items-center"
                  >
                    {editingCostIndex === idx ? (
                      <>
                        <input
                          type="text"
                          value={cost.name}
                          onChange={(e) => handleUpdateCost(idx, { ...cost, name: e.target.value })}
                          className="px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <input
                          type="number"
                          value={cost.amount}
                          onChange={(e) => handleUpdateCost(idx, { ...cost, amount: Number(e.target.value) })}
                          className="px-2 py-1 text-xs border border-slate-200 rounded text-right"
                        />
                        <select
                          value={cost.frequency}
                          onChange={(e) => handleUpdateCost(idx, { ...cost, frequency: e.target.value as "monthly" | "quarterly" | "yearly" })}
                          className="px-2 py-1 text-xs border border-slate-200 rounded text-right"
                        >
                          <option value="monthly">maandelijks</option>
                          <option value="quarterly">per kwartaal</option>
                          <option value="yearly">per jaar</option>
                        </select>
                        <span className="text-right text-slate-900 text-xs">{euro(monthlyFromFixedCost(cost))}</span>
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setEditingCostIndex(null)}
                            className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            ✓
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-medium">{cost.name}</span>
                        </div>
                        <span className="text-right text-slate-900">{euro(cost.amount)}</span>
                        <span className="text-right text-slate-500">
                          {cost.frequency === "monthly" && "maandelijks"}
                          {cost.frequency === "quarterly" && "per kwartaal"}
                          {cost.frequency === "yearly" && "per jaar"}
                        </span>
                        <span className="text-right text-slate-900">{euro(monthlyFromFixedCost(cost))}</span>
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setEditingCostIndex(idx)}
                            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                            aria-label="Bewerken"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCost(idx)}
                            className="px-2 py-1 text-xs text-rose-400 hover:text-rose-600"
                            aria-label="Verwijderen"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {isAddingCost && (
                  <div className="grid min-w-[600px] grid-cols-[2fr_1fr_1fr_1fr_auto] px-3 py-2 border-t border-slate-100 items-center bg-slate-50">
                    <input
                      type="text"
                      value={newCost.name}
                      onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                      className="px-2 py-1 text-xs border border-slate-200 rounded"
                      placeholder="Naam"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={newCost.amount || ""}
                      onChange={(e) => setNewCost({ ...newCost, amount: Number(e.target.value) })}
                      className="px-2 py-1 text-xs border border-slate-200 rounded text-right"
                      placeholder="Bedrag"
                    />
                    <select
                      value={newCost.frequency}
                      onChange={(e) => setNewCost({ ...newCost, frequency: e.target.value as "monthly" | "quarterly" | "yearly" })}
                      className="px-2 py-1 text-xs border border-slate-200 rounded text-right"
                    >
                      <option value="monthly">maandelijks</option>
                      <option value="quarterly">per kwartaal</option>
                      <option value="yearly">per jaar</option>
                    </select>
                    <span className="text-right text-slate-900 text-xs">{euro(monthlyFromFixedCost(newCost))}</span>
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={handleAddCost}
                        className="px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingCost(false);
                          setNewCost({ name: "", amount: 0, frequency: "monthly", kind: "vast" });
                        }}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <p className="text-[11px] text-slate-500 mt-3">
            UX-flow idee: je geeft hier je geschatte vaste kosten in (lening, energie, water, Netflix, ...). Facturen mogen
            variabel zijn: gebruik een gemiddeld bedrag. Deze info dient als extra inzicht naast je vermogen en hoeft geen exacte
            boekhouding te zijn.
          </p>
        </CardContent>
      </Card>
      </div>

      {/* Main chart */}
      <div className="mt-8">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-medium text-slate-800">Vermogen</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Evolutie van je totale vermogen doorheen de tijd.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1 text-xs">
              {Object.entries(rangeLabels).map(([key, label]) => {
                const value = key as Range;
                const active = range === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRange(value)}
                    className={cn(
                      "px-3 py-1 rounded-full font-medium transition text-[11px]",
                      active ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ left: 0, right: 0, top: 10 }}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => value.slice(0, 4)}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("nl-BE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })
                      .format(value as number)
                      .replace("€", "€ ")
                  }
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => euro(value)}
                  labelFormatter={(label: string) => `Per ${label}`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#22c55e"
                  fillOpacity={0.18}
                  fill="url(#netWorthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Notities sectie */}
          {filteredNotes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h4 className="text-sm font-medium text-slate-700">Notities</h4>
                <span className="text-xs text-slate-400">({filteredNotes.length})</span>
              </div>
              <div className="space-y-2">
                {filteredNotes.map((note) => {
                  const date = new Date(note.month + "-01");
                  const monthLabel = date.toLocaleDateString("nl-BE", {
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={note.month}
                      className="flex items-start gap-3 text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-500 min-w-[70px]">{monthLabel}</span>
                      <span className="text-slate-700">{note.note}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Financial Independence Info Modal */}
      {showFIModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFIModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Financial Independence (FI)</h2>
                  <p className="text-sm text-slate-500 mt-1">Wat betekent dit en hoe wordt het berekend?</p>
                </div>
                <button
                  onClick={() => setShowFIModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Sluiten"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">🎯 Wat is Financial Independence?</h3>
                  <p className="leading-relaxed">
                    Financial Independence (FI) betekent dat je genoeg vermogen hebt opgebouwd om van de opbrengsten
                    te kunnen leven zonder te hoeven werken. Je bent financieel onafhankelijk wanneer je passieve
                    inkomsten (zoals dividenden, interest, huur) je levenskosten dekken.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">📊 De 4% Regel</h3>
                  <p className="leading-relaxed mb-2">
                    De 4% regel is een vuistregel uit de FIRE-beweging (Financial Independence, Retire Early).
                    Deze regel stelt dat je veilig 4% van je vermogen per jaar kunt opnemen zonder dat je geld opraakt.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Formule:</strong> FI Doel = Jaarlijkse uitgaven × 25
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    (25 is het omgekeerde van 4%: 1 ÷ 0.04 = 25)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">🧮 Jouw Berekening</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Geschatte maandelijkse uitgaven:</span>
                      <span className="font-medium text-slate-900">{euro(avgMonthlySpending)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Jaarlijkse uitgaven:</span>
                      <span className="font-medium text-slate-900">{euro(yearlySpending)}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                      <span className="text-slate-600">FI Doel (× 25):</span>
                      <span className="font-semibold text-indigo-600">{euro(fiTarget)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Huidig vermogen:</span>
                      <span className="font-medium text-slate-900">{euro(currentNetWorth)}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                      <span className="text-slate-600">Voortgang:</span>
                      <span className="font-semibold text-emerald-600">{fiPct.toFixed(1)}%</span>
                    </div>
                    {fiPct < 100 && avgMonthlySavings > 0 && monthsToFI > 0 && (
                      <>
                        <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                          <span className="text-slate-600">Gemiddeld sparen per maand:</span>
                          <span className="font-medium text-slate-900">{euro(avgMonthlySavings)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Nog te gaan:</span>
                          <span className="font-medium text-slate-900">{euro(remainingToFI)}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-indigo-100 bg-indigo-50 -mx-4 px-4 py-2 mt-2">
                          <span className="text-indigo-700 font-medium">Geschatte tijd tot FI:</span>
                          <span className="font-semibold text-indigo-900">{yearsToFI.toFixed(1)} jaar</span>
                        </div>
                        <div className="flex justify-between text-xs bg-indigo-50 -mx-4 px-4 pb-2">
                          <span className="text-indigo-700">Verwachte datum:</span>
                          <span className="font-medium text-indigo-900">{fiDateString}</span>
                        </div>
                      </>
                    )}
                    {fiPct >= 100 && (
                      <div className="flex justify-center text-xs border-t border-emerald-200 bg-emerald-50 -mx-4 px-4 py-2 mt-2">
                        <span className="text-emerald-700 font-semibold">🎉 Je bent financieel onafhankelijk!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">💡 Voorbeeld</h3>
                  <p className="leading-relaxed">
                    Als je €2.000 per maand uitgeeft (€24.000 per jaar), dan heb je €600.000 nodig om financieel
                    onafhankelijk te zijn (€24.000 × 25). Met dit bedrag kun je theoretisch elk jaar €24.000 opnemen
                    (4% van €600.000) zonder dat je vermogen opraakt.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">⚠️ Belangrijke Kanttekeningen</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>De 4% regel is gebaseerd op historische data van de Amerikaanse aandelenmarkt</li>
                    <li>Inflatie, belastingen en marktschommelingen kunnen impact hebben</li>
                    <li>Dit is een vuistregel, geen garantie</li>
                    <li>Overweeg een veiligheidsmarge (bijv. 3.5% in plaats van 4%)</li>
                    <li>Raadpleeg een financieel adviseur voor persoonlijk advies</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    <strong>💡 Tip:</strong> Deze widget helpt je om je voortgang naar financiële onafhankelijkheid
                    te volgen. Het is een motiverend doel, maar vergeet niet om ook te genieten van het leven onderweg!
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowFIModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Begrepen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return <Dashboard />;
};

export default App;
