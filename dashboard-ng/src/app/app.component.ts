import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CashflowCardComponent } from './components/cashflow-card/cashflow-card.component';
import { ACCOUNT_TYPE_DATA, BANK_DISTRIBUTION_DATA, INITIAL_FIXED_COSTS, MONTH_NOTES, NET_WORTH_DATA } from './data/dashboard-data';
import { DistributionSlice, FixedCost, MonthNote, Range } from './models/dashboard';
import { formatEuro } from './utils/formatters';

const rangeLabels: Record<Range, string> = {
  all: 'Alles',
  ytd: 'YTD',
  '1y': '1J',
  '6m': '6M'
};

const monthlyFromFixedCost = (cost: FixedCost): number => {
  switch (cost.frequency) {
    case 'monthly':
      return cost.amount;
    case 'quarterly':
      return cost.amount / 3;
    case 'yearly':
      return cost.amount / 12;
    default:
      return cost.amount;
  }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgChartsModule, CashflowCardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly rangeOrder: Range[] = ['all', 'ytd', '1y', '6m'];
  protected readonly rangeLabels = rangeLabels;
  protected readonly euro = formatEuro;
  protected readonly range = signal<Range>('all');
  protected readonly netWorthData = signal([...NET_WORTH_DATA]);
  protected readonly monthNotes = signal<MonthNote[]>([...MONTH_NOTES]);
  protected readonly accountTypeData = signal<DistributionSlice[]>([...ACCOUNT_TYPE_DATA]);
  protected readonly bankDistributionData = signal<DistributionSlice[]>([...BANK_DISTRIBUTION_DATA]);
  protected readonly fixedCosts = signal<FixedCost[]>([...INITIAL_FIXED_COSTS]);
  protected readonly isNetWorthExpanded = signal(false);
  protected readonly showTypePercentages = signal(false);
  protected readonly showBankPercentages = signal(false);
  protected readonly estimatedMonthlyIncome = signal(5000);
  protected readonly yearlySavingsTarget = signal(10000);
  protected readonly goalAmount = signal(400000);
  protected readonly emergencyFundMonths = signal(6);
  protected readonly newCost = signal<FixedCost>({ name: '', amount: 0, frequency: 'monthly', kind: 'vast' });

  protected readonly filteredNetWorthData = computed(() => {
    const range = this.range();
    const points = this.netWorthData();
    if (points.length === 0) {
      return [] as typeof points;
    }

    if (range === 'all') {
      return points;
    }

    const last = points[points.length - 1];
    const lastDate = new Date(`${last.month}-01`);

    if (range === 'ytd') {
      return points.filter((point) => new Date(`${point.month}-01`).getFullYear() === lastDate.getFullYear());
    }

    const monthsBack = range === '1y' ? 11 : 5;
    const minDate = new Date(lastDate);
    minDate.setMonth(minDate.getMonth() - monthsBack);

    return points.filter((point) => new Date(`${point.month}-01`) >= minDate);
  });

  protected readonly filteredNotes = computed(() => {
    const filteredMonths = new Set(this.filteredNetWorthData().map((point) => point.month));
    return this.monthNotes().filter((note) => filteredMonths.has(note.month));
  });

  protected readonly currentNetWorth = computed(() => {
    const points = this.netWorthData();
    return points.length ? points[points.length - 1].value : 0;
  });

  protected readonly previousNetWorth = computed(() => {
    const points = this.netWorthData();
    return points.length > 1 ? points[points.length - 2].value : 0;
  });

  protected readonly netWorthDelta = computed(() => this.currentNetWorth() - this.previousNetWorth());

  protected readonly savingsAverages = computed(() => {
    const points = this.netWorthData();
    if (points.length < 2) {
      return { monthly: 0, yearly: 0 } as const;
    }

    const last = points[points.length - 1];
    const lastDate = new Date(`${last.month}-01`);
    const fromDate = new Date(lastDate);
    fromDate.setFullYear(fromDate.getFullYear() - 1);

    const filtered = points.filter((point) => {
      const date = new Date(`${point.month}-01`);
      return date >= fromDate && date <= lastDate;
    });

    if (filtered.length < 2) {
      return { monthly: 0, yearly: 0 } as const;
    }

    let totalDelta = 0;
    let periods = 0;

    for (let i = 1; i < filtered.length; i++) {
      totalDelta += filtered[i].value - filtered[i - 1].value;
      periods++;
    }

    const monthly = periods ? totalDelta / periods : 0;
    return { monthly, yearly: monthly * 12 } as const;
  });

  protected readonly avgMonthlySavings = computed(() => this.savingsAverages().monthly);
  protected readonly avgYearlySavings = computed(() => this.savingsAverages().yearly);

  protected readonly projectedBalance12m = computed(() => this.currentNetWorth() + this.avgMonthlySavings() * 12);
  protected readonly projectedGrowth12m = computed(() => this.avgMonthlySavings() * 12);

  protected readonly remainingToGoal = computed(() => this.goalAmount() - this.currentNetWorth());
  protected readonly goalAlreadyReached = computed(() => this.remainingToGoal() <= 0);
  protected readonly goalReachable = computed(() => this.avgMonthlySavings() > 0 && !this.goalAlreadyReached());

  protected readonly goalEta = computed(() => {
    if (!this.goalReachable()) {
      return { months: null, years: null, label: null } as const;
    }

    const months = this.remainingToGoal() / this.avgMonthlySavings();
    const years = months / 12;
    const target = new Date();
    target.setMonth(target.getMonth() + Math.ceil(months));
    const label = target.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' });
    return { months, years, label } as const;
  });

  protected readonly lastPointYear = computed(() => {
    const points = this.netWorthData();
    if (!points.length) {
      return new Date().getFullYear();
    }
    return new Date(`${points[points.length - 1].month}-01`).getFullYear();
  });

  protected readonly liquidNetWorth = computed(() =>
    this.accountTypeData()
      .filter((slice) => ['Zicht', 'Spaar', 'Cash'].includes(slice.name))
      .reduce((sum, slice) => sum + slice.value, 0)
  );

  protected readonly investmentsNetWorth = computed(() =>
    this.accountTypeData()
      .filter((slice) => slice.name === 'Beleggingen')
      .reduce((sum, slice) => sum + slice.value, 0)
  );

  protected readonly liquidPct = computed(() =>
    this.currentNetWorth() > 0 ? (this.liquidNetWorth() / this.currentNetWorth()) * 100 : 0
  );

  protected readonly investmentsPct = computed(() =>
    this.currentNetWorth() > 0 ? (this.investmentsNetWorth() / this.currentNetWorth()) * 100 : 0
  );

  protected readonly ytdChange = computed(() => {
    const points = this.netWorthData();
    if (!points.length) {
      return { change: 0, pct: 0 } as const;
    }

    const last = points[points.length - 1];
    const lastDate = new Date(`${last.month}-01`);
    const yearStart = points.find((point) => new Date(`${point.month}-01`).getFullYear() === lastDate.getFullYear());

    if (!yearStart) {
      return { change: 0, pct: 0 } as const;
    }

    const change = last.value - yearStart.value;
    const pct = yearStart.value ? (change / yearStart.value) * 100 : 0;
    return { change, pct } as const;
  });

  protected readonly savingsStreak = computed(() => {
    const points = this.netWorthData();
    let streak = 0;
    for (let i = points.length - 1; i > 0; i--) {
      const diff = points[i].value - points[i - 1].value;
      if (diff > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  });

  protected readonly savingsTrend = computed(() => {
    const points = this.netWorthData();
    if (points.length < 3) {
      return { trend: 0, direction: 'stable' as const };
    }

    const last = points[points.length - 1];
    const lastDate = new Date(`${last.month}-01`);
    const fromDate = new Date(lastDate);
    fromDate.setFullYear(fromDate.getFullYear() - 1);
    const filtered = points.filter((point) => {
      const date = new Date(`${point.month}-01`);
      return date >= fromDate && date <= lastDate;
    });

    if (filtered.length < 3) {
      return { trend: 0, direction: 'stable' as const };
    }

    const deltas: number[] = [];
    for (let i = 1; i < filtered.length; i++) {
      deltas.push(filtered[i].value - filtered[i - 1].value);
    }

    const n = deltas.length;
    const xMean = (n - 1) / 2;
    const yMean = deltas.reduce((sum, value) => sum + value, 0) / n;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = i - xMean;
      const yDiff = deltas[i] - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    let direction: 'improving' | 'declining' | 'stable' = 'stable';

    if (Math.abs(slope) < 50) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'improving';
    } else {
      direction = 'declining';
    }

    return { trend: slope, direction } as const;
  });

  protected readonly totalFixedMonthlyCosts = computed(() =>
    this.fixedCosts().reduce((sum, cost) => sum + monthlyFromFixedCost(cost), 0)
  );

  protected readonly avgMonthlySpending = computed(() => this.estimatedMonthlyIncome() - this.avgMonthlySavings());

  protected readonly runwayMonths = computed(() =>
    this.avgMonthlySpending() > 0 ? this.liquidNetWorth() / this.avgMonthlySpending() : 0
  );

  protected readonly emergencyFundTarget = computed(() => this.avgMonthlySpending() * this.emergencyFundMonths());
  protected readonly emergencyFundPct = computed(() =>
    this.emergencyFundTarget() > 0 ? (this.liquidNetWorth() / this.emergencyFundTarget()) * 100 : 0
  );

  protected readonly emergencyFundStatus = computed(() => {
    const pct = this.emergencyFundPct();
    if (pct >= 100) return 'excellent';
    if (pct >= 75) return 'good';
    if (pct >= 50) return 'fair';
    return 'insufficient';
  });

  protected readonly yearlySpending = computed(() => this.avgMonthlySpending() * 12);
  protected readonly fiTarget = computed(() => this.yearlySpending() * 25);
  protected readonly fiPct = computed(() => (this.fiTarget() > 0 ? (this.currentNetWorth() / this.fiTarget()) * 100 : 0));
  protected readonly monthsToFI = computed(() =>
    this.avgMonthlySavings() > 0 ? (this.fiTarget() - this.currentNetWorth()) / this.avgMonthlySavings() : 0
  );
  protected readonly yearsToFI = computed(() => this.monthsToFI() / 12);
  protected readonly fiDateString = computed(() => {
    const target = new Date();
    target.setMonth(target.getMonth() + Math.max(0, Math.ceil(this.monthsToFI())));
    return target.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' });
  });

  protected readonly totalCosts = computed(() => this.avgMonthlySpending());
  protected readonly savingsPctOfIncome = computed(() =>
    this.estimatedMonthlyIncome() > 0
      ? Math.max(0, Math.min(100, (this.avgMonthlySavings() / this.estimatedMonthlyIncome()) * 100))
      : 0
  );
  protected readonly costsPctOfIncome = computed(() => Math.max(0, Math.min(100, 100 - this.savingsPctOfIncome())));
  protected readonly fixedPctOfCosts = computed(() =>
    this.totalCosts() > 0 ? Math.max(0, Math.min(100, (this.totalFixedMonthlyCosts() / this.totalCosts()) * 100)) : 0
  );
  protected readonly otherCosts = computed(() => this.totalCosts() - this.totalFixedMonthlyCosts());
  protected readonly otherPctOfCosts = computed(() => Math.max(0, Math.min(100, 100 - this.fixedPctOfCosts())));

  protected readonly targetProgress = computed(() => this.ytdChange().change);
  protected readonly targetProgressPct = computed(() =>
    this.yearlySavingsTarget() > 0
      ? Math.max(0, Math.min(100, (this.targetProgress() / this.yearlySavingsTarget()) * 100))
      : 0
  );

  protected readonly accountDistributionTotal = computed(() =>
    this.accountTypeData().reduce((sum, slice) => sum + slice.value, 0)
  );
  protected readonly bankDistributionTotal = computed(() =>
    this.bankDistributionData().reduce((sum, slice) => sum + slice.value, 0)
  );

  protected readonly netWorthChartData = computed<ChartData<'line'>>(() => {
    const dataset = this.filteredNetWorthData();
    return {
      labels: dataset.map((point) => point.month),
      datasets: [
        {
          label: 'Totaal vermogen',
          data: dataset.map((point) => point.value),
          fill: true,
          tension: 0.35,
          borderColor: '#0ea5e9',
          borderWidth: 3,
          backgroundColor: 'rgba(14,165,233,0.15)',
          pointRadius: 3,
          pointBackgroundColor: '#0ea5e9'
        }
      ]
    };
  });

  protected readonly netWorthChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148,163,184,0.2)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => ` ${formatEuro(context.parsed.y ?? 0)}`
        }
      }
    }
  };

  protected readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { display: false }
    }
  };

  protected readonly accountChartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.accountTypeData().map((slice) => slice.name),
    datasets: [
      {
        data: this.accountTypeData().map((slice) => slice.value),
        backgroundColor: ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b'],
        borderWidth: 0
      }
    ]
  }));

  protected readonly bankChartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.bankDistributionData().map((slice) => slice.name),
    datasets: [
      {
        data: this.bankDistributionData().map((slice) => slice.value),
        backgroundColor: ['#334155', '#2563eb', '#f97316', '#10b981'],
        borderWidth: 0
      }
    ]
  }));

  protected readonly ranges = this.rangeOrder;

  setRange(range: Range): void {
    this.range.set(range);
  }

  toggleNetWorthExpanded(): void {
    this.isNetWorthExpanded.update((value) => !value);
  }

  toggleTypePercentages(): void {
    this.showTypePercentages.update((value) => !value);
  }

  toggleBankPercentages(): void {
    this.showBankPercentages.update((value) => !value);
  }

  updateEstimatedIncome(value: number): void {
    this.estimatedMonthlyIncome.set(Math.max(0, value));
  }

  updateYearlyTarget(value: number): void {
    this.yearlySavingsTarget.set(Math.max(0, value));
  }

  updateGoalAmount(value: number): void {
    this.goalAmount.set(Math.max(0, value));
  }

  updateEmergencyFundMonths(value: number): void {
    this.emergencyFundMonths.set(Math.max(0, value));
  }

  updateNewCost(partial: Partial<FixedCost>): void {
    this.newCost.update((current) => ({ ...current, ...partial }));
  }

  addFixedCost(): void {
    const cost = this.newCost();
    if (!cost.name.trim() || cost.amount <= 0) {
      return;
    }
    this.fixedCosts.update((current) => [...current, { ...cost }]);
    this.newCost.set({ name: '', amount: 0, frequency: 'monthly', kind: 'vast' });
  }

  removeFixedCost(index: number): void {
    this.fixedCosts.update((current) => current.filter((_, i) => i !== index));
  }

  formatMonth(month: string): string {
    const date = new Date(`${month}-01`);
    return date.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' });
  }
}
