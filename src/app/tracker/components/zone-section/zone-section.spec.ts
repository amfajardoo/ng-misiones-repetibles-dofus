import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { parallel } from '@angular/cdk/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { QuestPeriodFilter } from '../../models/period';
import { Quest } from '../../models/quest';
import { QuestProgressService } from '../../services/quest-progress.service';
import { Zone } from '../../models/zone';
import { ZoneSection } from './zone-section';
import { ZoneSectionHarness } from './zone-section.harness';

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
    icon: '🏙',
    quests: [buildQuest()],
    ...overrides,
  };
}

const TEST_ZONE = buildZone({
  id: 'test-zone',
  name: 'Test Zone',
  quests: [
    buildQuest({ id: 't1', name: 'Test daily quest', url: 'https://example.com/t1', kamas: 100 }),
    buildQuest({
      id: 't2',
      name: 'Test weekly quest',
      url: 'https://example.com/t2',
      kamas: 200,
      period: 'weekly',
    }),
  ],
});

@Component({
  imports: [ZoneSection],
  template: `<app-zone-section [zone]="zone" [periodFilter]="periodFilter()" />`,
})
class ZoneSectionHost {
  readonly zone = TEST_ZONE;
  readonly periodFilter = input<QuestPeriodFilter>('all');
}

describe('ZoneSection', () => {
  beforeEach(() => localStorage.clear());

  async function setup(periodFilter: QuestPeriodFilter = 'all') {
    await TestBed.configureTestingModule({
      imports: [ZoneSectionHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZoneSectionHost);
    fixture.componentRef.setInput('periodFilter', periodFilter);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    return { fixture, loader, progress: TestBed.inject(QuestProgressService) };
  }

  describe('quest completion', () => {
    it('toggling a checkbox marks the quest completed in the progress service', async () => {
      const { loader, progress } = await setup();
      const zone = await loader.getHarness(ZoneSectionHarness);

      await zone.toggleQuest('Test daily quest');

      expect(progress.isCompleted('t1')).toBe(true);
    });

    it('shows the checked state from the progress service', async () => {
      const { fixture, loader, progress } = await setup();
      progress.setCompleted('t2', true);
      await fixture.whenStable();
      const zone = await loader.getHarness(ZoneSectionHarness);

      expect(await zone.isQuestChecked('Test weekly quest')).toBe(true);
    });
  });

  describe('period filter', () => {
    it.each([
      {
        filter: 'all',
        expected: ['Completar misión Test daily quest', 'Completar misión Test weekly quest'],
      },
      { filter: 'daily', expected: ['Completar misión Test daily quest'] },
      { filter: 'weekly', expected: ['Completar misión Test weekly quest'] },
    ] as const)(
      'shows $expected when the filter is $filter',
      async ({ filter, expected }) => {
        const { loader } = await setup(filter);

        const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
        const labels = await parallel(() => checkboxes.map((c) => c.getAriaLabel()));

        expect(labels).toEqual(expected);
      },
    );
  });

  describe('collapse', () => {
    it('hides the quests and collapses the header when pressed', async () => {
      const { loader } = await setup();
      const zone = await loader.getHarness(ZoneSectionHarness);

      await zone.toggleCollapse();

      const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);

      expect(await zone.isExpanded()).toBe(false);
      expect(checkboxes).toHaveLength(0);
    });
  });

  describe('zone progress', () => {
    it('reflects completion in the progress bar', async () => {
      const { fixture, loader, progress } = await setup();
      progress.setCompleted('t1', true);
      await fixture.whenStable();

      const bar = await loader.getHarness(MatProgressBarHarness);

      expect(await bar.getValue()).toBe(50);
    });
  });
});
