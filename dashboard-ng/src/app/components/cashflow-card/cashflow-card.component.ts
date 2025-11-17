import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatEuro } from '../../utils/formatters';

@Component({
  selector: 'app-cashflow-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cashflow-card.component.html',
  styleUrls: ['./cashflow-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashflowCardComponent {
  readonly estimatedMonthlyIncome = input.required<number>();
  readonly avgMonthlySavings = input.required<number>();
  readonly avgMonthlySpending = input.required<number>();
  readonly totalFixedMonthlyCosts = input.required<number>();
  readonly otherCosts = input.required<number>();
  readonly fixedPctOfCosts = input.required<number>();
  readonly otherPctOfCosts = input.required<number>();
  readonly savingsPctOfIncome = input.required<number>();
  readonly costsPctOfIncome = input.required<number>();

  protected readonly euro = formatEuro;
  protected readonly isExpanded = signal(false);

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }
}
