import { TestBed } from '@angular/core/testing';
import { ZONE_CATALOGUE } from '../data/zone-catalogue.token';
import { Quest } from '../models/quest';
import { Zone } from '../models/zone';
import { QuestProgressService } from './quest-progress.service';
import { QuestProgressStorageService } from './quest-progress-storage.service';
import { QuestStatsService } from './quest-stats.service';

function buildQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest',
    name: 'Quest',
    url: 'https://example.com/quest',
    kamas: 0,
    annexe: null,
    period: 'daily',
    ...overrides,
  };
}

function buildZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: 'zone',
    name: 'Zone',
    icon: 'Z',
    quests: [buildQuest()],
    ...overrides,
  };
}

const NORMAL_ZONE = buildZone({
  id: 'normal-zone',
  name: 'Normal',
  icon: 'Y',
  quests: [
    buildQuest({ id: 'n1', name: 'Normal daily', url: 'https://example.com/n1', kamas: 500 }),
    buildQuest({
      id: 'n2',
      name: 'Normal weekly',
      url: 'https://example.com/n2',
      kamas: 3000,
      period: 'weekly',
    }),
  ],
});

const VARIANT_ZONE = buildZone({
  id: 'variant-zone',
  name: 'Variant',
  variant: true,
  variantNote: 'Only one per day.',
  quests: [
    buildQuest({ id: 'v1', name: 'Variant one', url: 'https://example.com/v1', kamas: 1000 }),
    buildQuest({ id: 'v2', name: 'Variant two', url: 'https://example.com/v2', kamas: 2000 }),
  ],
});

const TEST_ZONES: readonly Zone[] = [NORMAL_ZONE, VARIANT_ZONE];

const storageStub = {
  load: () => null,
  save: () => undefined,
} satisfies Pick<QuestProgressStorageService, 'load' | 'save'>;

describe('QuestStatsService', () => {
  let service: QuestStatsService;
  let progress: QuestProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ZONE_CATALOGUE, useValue: TEST_ZONES },
        { provide: QuestProgressStorageService, useValue: storageStub },
      ],
    });
    service = TestBed.inject(QuestStatsService);
    progress = TestBed.inject(QuestProgressService);
  });

  describe('overallProgress', () => {
    it('reports zero completions on a fresh state', () => {
      const result = service.overallProgress();

      expect(result.questCounts.totalQuests).toBe(4);
      expect(result.questCounts.completedQuests).toBe(0);
      expect(result.completionPercentage).toBe(0);
    });

    it('counts completed quests and percentage', () => {
      progress.setCompleted('n1', true);
      progress.setCompleted('v1', true);

      const result = service.overallProgress();

      expect(result.questCounts.completedQuests).toBe(2);
      expect(result.completionPercentage).toBe(50);
    });
  });

  describe('dailyKamasSummary', () => {
    it('sums every non-variant quest kamas plus each variant zone rate', () => {
      const result = service.dailyKamasSummary();

      expect(result.maxDailyKamas).toBe(500 + 3000 + 1000);
      expect(result.earnedDailyKamas).toBe(0);
      expect(result.remainingDailyKamas).toBe(4500);
    });

    it('earns only the variant rate even when two variant quests are checked', () => {
      progress.setCompleted('v1', true);
      progress.setCompleted('v2', true);

      const result = service.dailyKamasSummary();

      expect(result.earnedDailyKamas).toBe(1000);
      expect(result.remainingDailyKamas).toBe(3500);
    });

    it('earns the variant rate when any variant quest is checked', () => {
      progress.setCompleted('v2', true);

      const result = service.dailyKamasSummary();

      expect(result.earnedDailyKamas).toBe(1000);
    });
  });

  describe('zoneCompletion', () => {
    it('reports quest counts and percentage for a zone', () => {
      progress.setCompleted('n1', true);

      const result = service.zoneCompletion(NORMAL_ZONE);

      expect(result.totalQuests).toBe(2);
      expect(result.completedQuests).toBe(1);
      expect(result.completionPercentage).toBe(50);
    });
  });

  describe('zoneKamasSummary', () => {
    it('sums remaining kamas for unchecked quests in a normal zone', () => {
      progress.setCompleted('n1', true);

      const result = service.zoneKamasSummary(NORMAL_ZONE);

      expect(result.totalKamas).toBe(3500);
      expect(result.remainingKamas).toBe(3000);
    });

    it('zeroes remaining kamas for a variant zone when any quest is checked', () => {
      progress.setCompleted('v2', true);

      const result = service.zoneKamasSummary(VARIANT_ZONE);

      expect(result.totalKamas).toBe(1000);
      expect(result.remainingKamas).toBe(0);
    });

    it('keeps the variant rate as remaining when nothing is checked', () => {
      const result = service.zoneKamasSummary(VARIANT_ZONE);

      expect(result.remainingKamas).toBe(1000);
    });
  });

  describe('questsForPeriod', () => {
    it.each([
      { filter: 'all', expected: ['n1', 'n2'] },
      { filter: 'daily', expected: ['n1'] },
      { filter: 'weekly', expected: ['n2'] },
    ] as const)('returns $expected when the filter is $filter', ({ filter, expected }) => {
      const quests = service.questsForPeriod(NORMAL_ZONE, filter);

      expect(quests.map((q) => q.id)).toEqual(expected);
    });
  });

  describe('zonesContainingPeriod', () => {
    it.each([
      { filter: 'all', expected: ['normal-zone', 'variant-zone'] },
      { filter: 'weekly', expected: ['normal-zone'] },
    ] as const)('returns $expected when the filter is $filter', ({ filter, expected }) => {
      const zones = service.zonesContainingPeriod(filter);

      expect(zones.map((z) => z.id)).toEqual(expected);
    });
  });
});
