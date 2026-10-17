import { Component, computed, inject, input, signal } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { QuestPeriodFilter } from '../../models/period';
import { Quest } from '../../models/quest';
import { Zone } from '../../models/zone';
import { QuestProgressService } from '../../services/quest-progress.service';
import { QuestStatsService } from '../../services/quest-stats.service';
import { FormatNumberPipe } from '../../utils/format-number.pipe';
import { QuestCompletedPipe } from '../../utils/quest-completed.pipe';

@Component({
  selector: 'app-zone-section',
  imports: [MatCheckbox, MatIcon, MatProgressBar, MatTableModule, FormatNumberPipe, QuestCompletedPipe],
  templateUrl: './zone-section.html',
  styleUrl: './zone-section.scss',
})
export class ZoneSection {
  protected readonly progress = inject(QuestProgressService);
  private readonly stats = inject(QuestStatsService);

  readonly zone = input.required<Zone>();
  readonly periodFilter = input<QuestPeriodFilter>('all');

  protected readonly displayedColumns: string[] = ['name', 'kamas', 'annexe', 'period', 'check'];
  protected readonly isCollapsed = signal(false);

  protected readonly visibleQuests = computed<readonly Quest[]>(() =>
    this.stats.questsForPeriod(this.zone(), this.periodFilter()),
  );

  protected readonly completion = computed(() => this.stats.zoneCompletion(this.zone()));
  protected readonly kamasSummary = computed(() => this.stats.zoneKamasSummary(this.zone()));

  protected toggleCollapse(): void {
    this.isCollapsed.update((current) => !current);
  }

  protected setQuestCompleted(questId: string, completed: boolean): void {
    this.progress.setCompleted(questId, completed);
  }
}
