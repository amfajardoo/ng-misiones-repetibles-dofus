import { computed, inject, Injectable } from '@angular/core';
import { ZONES } from '../data/zones';
import { Quest } from '../models/quest';
import { QuestPeriodFilter } from '../models/period';
import { Zone } from '../models/zone';
import { QuestProgressService } from './quest-progress.service';

export interface DailyKamasSummary {
  readonly maxDailyKamas: number;
  readonly earnedDailyKamas: number;
  readonly remainingDailyKamas: number;
}

export interface QuestCountSummary {
  readonly totalQuests: number;
  readonly completedQuests: number;
}

export interface OverallProgress {
  readonly questCounts: QuestCountSummary;
  readonly completionPercentage: number;
}

export interface ZoneCompletion {
  readonly totalQuests: number;
  readonly completedQuests: number;
  readonly completionPercentage: number;
}

export interface ZoneKamasSummary {
  readonly totalKamas: number;
  readonly remainingKamas: number;
}

/**
 * Derived progress statistics. Reads completion state from
 * QuestProgressService and the static zone catalogue; holds no state of its own.
 */
@Injectable({ providedIn: 'root' })
export class QuestStatsService {
  private readonly progress = inject(QuestProgressService);

  readonly zones: readonly Zone[] = ZONES;

  readonly overallProgress = computed<OverallProgress>(() => {
    const completed = this.progress.completedQuests();
    let totalQuests = 0;
    let completedCount = 0;

    for (const zone of this.zones) {
      for (const quest of zone.quests) {
        totalQuests++;
        if (completed[quest.id]) completedCount++;
      }
    }

    return {
      questCounts: { totalQuests, completedQuests: completedCount },
      completionPercentage: totalQuests
        ? Math.round((completedCount / totalQuests) * 100)
        : 0,
    };
  });

  readonly dailyKamasSummary = computed<DailyKamasSummary>(() => {
    const completed = this.progress.completedQuests();
    let maxDailyKamas = 0;
    let earnedDailyKamas = 0;

    for (const zone of this.zones) {
      if (zone.variant) {
        const rate = zone.quests[0]?.kamas ?? 0;
        maxDailyKamas += rate;
        if (zone.quests.some((q) => completed[q.id])) earnedDailyKamas += rate;
      } else {
        for (const quest of zone.quests) {
          maxDailyKamas += quest.kamas;
          if (completed[quest.id]) earnedDailyKamas += quest.kamas;
        }
      }
    }

    return {
      maxDailyKamas,
      earnedDailyKamas,
      remainingDailyKamas: maxDailyKamas - earnedDailyKamas,
    };
  });

  zoneCompletion(zone: Zone): ZoneCompletion {
    const completed = this.progress.completedQuests();
    const totalQuests = zone.quests.length;
    const completedQuests = zone.quests.filter((q) => completed[q.id]).length;
    return {
      totalQuests,
      completedQuests,
      completionPercentage: totalQuests
        ? Math.round((completedQuests / totalQuests) * 100)
        : 0,
    };
  }

  zoneKamasSummary(zone: Zone): ZoneKamasSummary {
    const completed = this.progress.completedQuests();

    if (zone.variant) {
      const rate = zone.quests[0]?.kamas ?? 0;
      const remainingKamas = zone.quests.some((q) => completed[q.id]) ? 0 : rate;
      return { totalKamas: rate, remainingKamas };
    }

    let totalKamas = 0;
    let remainingKamas = 0;
    for (const quest of zone.quests) {
      totalKamas += quest.kamas;
      if (!completed[quest.id]) remainingKamas += quest.kamas;
    }
    return { totalKamas, remainingKamas };
  }

  questsForPeriod(zone: Zone, period: QuestPeriodFilter): readonly Quest[] {
    return period === 'all' ? zone.quests : zone.quests.filter((q) => q.period === period);
  }

  zonesContainingPeriod(period: QuestPeriodFilter): readonly Zone[] {
    if (period === 'all') return this.zones;
    return this.zones.filter((z) => z.quests.some((q) => q.period === period));
  }
}
