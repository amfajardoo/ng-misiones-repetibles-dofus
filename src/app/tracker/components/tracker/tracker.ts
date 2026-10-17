import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog } from '../../../shared/dialogs/confirm-dialog';
import { QuestPeriodFilter } from '../../models/period';
import { QuestProgressService } from '../../services/quest-progress.service';
import { QuestStatsService } from '../../services/quest-stats.service';
import { FormatNumberPipe } from '../../utils/format-number.pipe';
import { ZoneSection } from '../zone-section/zone-section';

@Component({
  selector: 'app-tracker',
  imports: [MatButton, MatIcon, ZoneSection, FormatNumberPipe],
  templateUrl: './tracker.html',
  styleUrl: './tracker.scss',
})
export class Tracker {
  private readonly progress = inject(QuestProgressService);
  protected readonly stats = inject(QuestStatsService);
  private readonly dialog = inject(MatDialog);

  protected readonly periodFilter = signal<QuestPeriodFilter>('all');

  protected readonly filters: readonly { value: QuestPeriodFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'daily', label: 'Diarias' },
    { value: 'weekly', label: 'Semanal' },
  ];

  protected readonly zonesToShow = computed(() =>
    this.stats.zonesContainingPeriod(this.periodFilter()),
  );

  protected setPeriodFilter(filter: QuestPeriodFilter): void {
    this.periodFilter.set(filter);
  }

  protected async clearAllCompletions(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog.open(ConfirmDialog).afterClosed(),
    );
    if (confirmed) {
      this.progress.clearAll();
    }
  }
}
