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

const fixedCosts: FixedCost[] = [
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

type SavingsRange = "all" | "12m" | "6m";

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

const Dashboard: React.FC = () => {
  const [range, setRange] = useState<Range>("all");
  const [savingsRange, setSavingsRange] = useState<SavingsRange>("12m");

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

  const currentNetWorth = netWorthData[netWorthData.length - 1].value;
  const previousNetWorth = netWorthData[netWorthData.length - 2].value;
  const delta = currentNetWorth - previousNetWorth;

  const { avgMonthlySavings, avgYearlySavings, savingsLabel } = useMemo(() => {
    if (netWorthData.length < 2) {
      return {
        avgMonthlySavings: 0,
        avgYearlySavings: 0,
        savingsLabel: "onvoldoende data",
      } as const;
    }

    const last = netWorthData[netWorthData.length - 1];
    const lastDate = new Date(last.month + "-01");

    let fromDate: Date;
    if (savingsRange === "all") {
      fromDate = new Date(netWorthData[0].month + "-01");
    } else if (savingsRange === "12m") {
      fromDate = new Date(lastDate);
      fromDate.setFullYear(fromDate.getFullYear() - 1);
    } else {
      fromDate = new Date(lastDate);
      fromDate.setMonth(fromDate.getMonth() - 6);
    }

    const points = netWorthData.filter((d) => {
      const date = new Date(d.month + "-01");
      return date >= fromDate && date <= lastDate;
    });

    if (points.length < 2) {
      return {
        avgMonthlySavings: 0,
        avgYearlySavings: 0,
        savingsLabel: "onvoldoende data",
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

    let label: string;
    switch (savingsRange) {
      case "all":
        label = "je volledige historiek";
        break;
      case "12m":
        label = "de laatste 12 maanden";
        break;
      case "6m":
        label = "de laatste 6 maanden";
        break;
      default:
        label = "de gekozen periode";
    }

    return {
      avgMonthlySavings: monthly,
      avgYearlySavings: yearly,
      savingsLabel: label,
    } as const;
  }, [savingsRange]);

  // ---- FORECAST + TIME-TO-GOAL LOGIC ----
  const projectedBalance12m = currentNetWorth + avgMonthlySavings * 12;
  const projectedGrowth12m = avgMonthlySavings * 12;

  const goalAmount = 400000;
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

  // Mock value voor inspiratie - in jouw app haal je dit idealiter uit je uitgavenanalyse
  const avgMonthlyExpenses = 2500;
  const runwayMonths = liquidNetWorth / avgMonthlyExpenses;

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

  const yearlySavingsTarget = 10000; // Mock-doel ter inspiratie
  const targetProgress = ytdChange;
  const targetProgressPct = yearlySavingsTarget
    ? Math.max(0, Math.min(100, (targetProgress / yearlySavingsTarget) * 100))
    : 0;

  const totalFixedMonthlyCosts = useMemo(() => {
    return fixedCosts.reduce((sum, cost) => sum + monthlyFromFixedCost(cost), 0);
  }, []);

  const estimatedMonthlyIncome = 5000; // mock-inkomen voor inspiratie

  const avgMonthlySpending = useMemo(() => {
    return estimatedMonthlyIncome - avgMonthlySavings;
  }, [estimatedMonthlyIncome, avgMonthlySavings]);

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
    <div className="w-full min-h-screen bg-slate-50 px-6 py-8 md:px-10 lg:px-16 space-y-6">
      {/* Page header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">Welkom bij je financiële overzicht.</p>
      </header>

      {/* Top row: total net worth */}
      <div className="grid gap-4 lg:grid-cols-1">
        {/* Totaal vermogen */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-slate-800">Totaal Vermogen</CardTitle>
              <CardDescription className="text-xs mt-1 text-slate-500">Per november 2025</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-semibold text-emerald-500">{euro(currentNetWorth)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Netto verandering vorige maand */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Verandering t.o.v. vorige maand</CardTitle>
            <CardDescription className="text-xs text-slate-500">Netto stijging of daling van je vermogen.</CardDescription>
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
            <p className="text-xs text-slate-500">Op basis van vorige maand.</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings & spending row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Gemiddeld spaarsaldo */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Gemiddeld spaarsaldo</CardTitle>
            <CardDescription className="text-xs text-slate-500">Op basis van {savingsLabel}.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex flex-col justify-between gap-4">
              <div>
                <div className="space-y-1">
                  <div className="text-xl font-semibold text-slate-900">{euro(avgMonthlySavings)} / maand</div>
                  <div className="text-xs text-slate-500">≈ {euro(avgYearlySavings)} per jaar</div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Inclusief alle rekeningen.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  className={cn(
                    "rounded-full h-7 px-3 text-[11px]",
                    savingsRange === "all" && "bg-slate-900 text-slate-50 border-slate-900"
                  )}
                  onClick={() => setSavingsRange("all")}
                >
                  Alles
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className={cn(
                    "rounded-full h-7 px-3 text-[11px] text-slate-500",
                    savingsRange === "12m" && "bg-slate-900 text-slate-50 hover:text-slate-50"
                  )}
                  onClick={() => setSavingsRange("12m")}
                >
                  Laatste jaar
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className={cn(
                    "rounded-full h-7 px-3 text-[11px] text-slate-500",
                    savingsRange === "6m" && "bg-slate-900 text-slate-50 hover:text-slate-50"
                  )}
                  onClick={() => setSavingsRange("6m")}
                >
                  6 maanden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gemiddelde uitgaven per maand */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Gemiddelde uitgaven</CardTitle>
            <CardDescription className="text-xs text-slate-500">Op basis van inkomen minus spaargedrag.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-1">
            <div className="text-xl font-semibold text-slate-900">{euro(avgMonthlySpending)} / maand</div>
            <p className="text-xs text-slate-500">Inclusief vaste + variabele uitgaven.</p>
          </CardContent>
        </Card>
      </div>

      {/* Extra metrics row */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {/* Runway */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Runway</CardTitle>
            <CardDescription className="text-xs text-slate-500">Hoelang je huidige buffer je kan dragen.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2">
            <div className="text-xl font-semibold text-slate-900">{runwayMonths.toFixed(1)} maanden</div>
            <p className="text-xs text-slate-500">Op basis van {euro(avgMonthlyExpenses)} uitgaven per maand.</p>
          </CardContent>
        </Card>

        {/* Geschat inkomen */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Geschat inkomen</CardTitle>
            <CardDescription className="text-xs text-slate-500">Je totale geschatte maandelijkse inkomsten.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2">
            <div className="text-xl font-semibold text-slate-900">{euro(estimatedMonthlyIncome)} / maand</div>
            <p className="text-xs text-slate-500">Optioneel gecombineerd inkomen van Bram &amp; Liesbeth.</p>
          </CardContent>
        </Card>

        {/* Maandelijkse cashflow */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Maandelijkse cashflow</CardTitle>
            <CardDescription className="text-xs text-slate-500">Samenvatting van inkomen, sparen en totale kosten.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-3 text-xs">
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

            <div className="pl-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vaste kosten</span>
                <span className="font-medium text-slate-900">
                  {euro(totalFixedMonthlyCosts)} ({fixedPctOfCosts.toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overige kosten</span>
                <span className="font-medium text-slate-900">
                  {euro(Math.max(0, otherCosts))} ({otherPctOfCosts.toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Balk: sparen vs kosten als % van inkomen */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Sparen vs kosten (t.o.v. inkomen)</span>
                <span>
                  {savingsPctOfIncome.toFixed(0)}% sparen / {costsPctOfIncome.toFixed(0)}% kosten
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${savingsPctOfIncome.toFixed(0)}%` }}
                />
              </div>
            </div>

            {/* Balk: vaste vs overige kosten binnen totale kosten */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Vaste vs overige kosten (binnen kosten)</span>
                <span>
                  {fixedPctOfCosts.toFixed(0)}% vast / {otherPctOfCosts.toFixed(0)}% overige
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-400"
                  style={{ width: `${fixedPctOfCosts.toFixed(0)}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-2">
              Van je inkomen van {euro(estimatedMonthlyIncome)} per maand spaar je gemiddeld {euro(avgMonthlySavings)}.
              Je totale kosten bedragen {euro(avgMonthlySpending)}, waarvan {euro(totalFixedMonthlyCosts)} vaste kosten zijn en {euro(Math.max(0, otherCosts))} overige kosten.
            </p>
          </CardContent>
        </Card>

        {/* Netto verandering YTD */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Netto verandering YTD</CardTitle>
            <CardDescription className="text-xs text-slate-500">Sinds 1 januari {lastPointYear}.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2">
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
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Savings streak</CardTitle>
            <CardDescription className="text-xs text-slate-500">Aantal opeenvolgende maanden waarin je vermogen steeg.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2">
            <div className="text-xl font-semibold text-slate-900">
              {savingsStreak} maand{savingsStreak === 1 ? "" : "en"} op rij
            </div>
            <p className="text-xs text-slate-500">Reset wanneer een maand daalt t.o.v. de vorige.</p>
          </CardContent>
        </Card>

        {/* Jaarlijks spaardoel */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Jaarlijks spaardoel</CardTitle>
            <CardDescription className="text-xs text-slate-500">Voorbeeld: {euro(yearlySavingsTarget)} in {lastPointYear}.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500">Totaal gespaard YTD</span>
              <span className="font-medium text-slate-900">{euro(Math.max(0, targetProgress))}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${targetProgressPct.toFixed(0)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{targetProgressPct.toFixed(0)}% behaald</span>
              <span>Doel: {euro(yearlySavingsTarget)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Projectie 12 maanden */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Projectie 12 maanden</CardTitle>
            <CardDescription className="text-xs text-slate-500">Op basis van je huidige gemiddelde spaargedrag ({savingsLabel}).</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2">
            <div className="text-xl font-semibold text-slate-900">{euro(projectedBalance12m)}</div>
            <p className="text-xs text-slate-500">≈ {euro(projectedGrowth12m)} groei t.o.v. nu in één jaar.</p>
          </CardContent>
        </Card>

        {/* Tijd tot doelvermogen */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Tijd tot doel</CardTitle>
            <CardDescription className="text-xs text-slate-500">Doelvermogen: {euro(goalAmount)}.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-2 text-xs">
            {goalAlreadyReached ? (
              <>
                <p className="text-slate-900 font-medium">Je hebt je doel al bereikt. 🎉</p>
                <p className="text-slate-500">Huidig vermogen is hoger dan {euro(goalAmount)}.</p>
              </>
            ) : !goalReachable ? (
              <>
                <p className="text-slate-900 font-medium">
                  Huidig spaartempo is onvoldoende om het doel te bereiken.
                </p>
                <p className="text-slate-500">
                  Verhoog je spaargedrag of verlaag je doel om een realistische inschatting te krijgen.
                </p>
              </>
            ) : (
              <>
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
          </CardContent>
        </Card>

        {/* Verdeling per type */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Verdeling per type</CardTitle>
            <CardDescription className="text-xs text-slate-500">Hoe je vermogen nu verdeeld is.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 flex items-center gap-4">
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
              {accountTypeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-medium text-slate-900">{euro(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verdeling per bank */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Verdeling per bank</CardTitle>
            <CardDescription className="text-xs text-slate-500">Hoe je vermogen over banken gespreid is.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1 flex items-center gap-4">
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
              {bankDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-medium text-slate-900">{euro(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vaste kosten detail + UX flow */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div>
            <CardTitle className="text-base font-medium text-slate-800">Geschatte vaste kosten</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Geef hier een inschatting van je terugkerende vaste kosten (bv. lening, energie, water, Netflix, ...). Dit is
              bedoeld als extra inzicht en hoeft niet tot op de euro juist te zijn.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            Nieuwe vaste kost
          </Button>
        </CardHeader>
        <CardContent className="pt-0 text-xs">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-slate-500">Geschat totaal vaste kosten / maand</span>
            <span className="text-sm font-semibold text-slate-900">{euro(totalFixedMonthlyCosts)}</span>
          </div>
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-slate-50 px-3 py-2 font-medium text-[11px] text-slate-500 uppercase tracking-wide">
              <span>Kost</span>
              <span className="text-right">Bedrag</span>
              <span className="text-right">Frequentie</span>
              <span className="text-right">Maandelijks</span>
            </div>
            {fixedCosts.map((cost, idx) => (
              <div
                key={cost.name + idx}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] px-3 py-2 border-t border-slate-100 items-center"
              >
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
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            UX-flow idee: je geeft hier je geschatte vaste kosten in (lening, energie, water, Netflix, ...). Facturen mogen
            variabel zijn: gebruik een gemiddeld bedrag. Deze info dient als extra inzicht naast je vermogen en hoeft geen exacte
            boekhouding te zijn.
          </p>
        </CardContent>
      </Card>

      {/* Main chart */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-medium text-slate-800">Vermogen</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Evolutie van je totale vermogen doorheen de tijd.
            </CardDescription>
          </div>
          <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-xs">
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
        </CardContent>
      </Card>
    </div>
  );
};

const App: React.FC = () => {
  return <Dashboard />;
};

export default App;
