import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { QuestProgressService } from '../../services/quest-progress.service';
import { Tracker } from './tracker';

describe('Tracker', () => {
  beforeEach(() => localStorage.clear());

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [Tracker],
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Tracker);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const progress = TestBed.inject(QuestProgressService);
    return { fixture, loader, rootLoader, progress };
  }

  describe('period filters', () => {
    it('marks the active filter with aria-pressed', async () => {
      const { loader } = await setup();
      const allButton = await loader.getHarness(MatButtonHarness.with({ text: 'Todas' }));
      const dailyButton = await loader.getHarness(MatButtonHarness.with({ text: 'Diarias' }));

      expect(await (await allButton.host()).getAttribute('aria-pressed')).toBe('true');
      expect(await (await dailyButton.host()).getAttribute('aria-pressed')).toBe('false');
    });

    it('switches the active filter when Diarias is pressed', async () => {
      const { loader } = await setup();
      const dailyButton = await loader.getHarness(MatButtonHarness.with({ text: 'Diarias' }));

      await dailyButton.click();

      const allButton = await loader.getHarness(MatButtonHarness.with({ text: 'Todas' }));

      expect(await (await dailyButton.host()).getAttribute('aria-pressed')).toBe('true');
      expect(await (await allButton.host()).getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('clear all', () => {
    it('keeps completions when the dialog is cancelled', async () => {
      const { fixture, loader, rootLoader, progress } = await setup();
      progress.setCompleted('q1', true);
      const resetButton = await loader.getHarness(
        MatButtonHarness.with({ text: /Desmarcar todo/ }),
      );

      await resetButton.click();
      const cancelButton = await rootLoader.getHarness(
        MatButtonHarness.with({ text: 'Cancelar', ancestor: 'mat-dialog-container' }),
      );
      await cancelButton.click();
      await fixture.whenStable();

      expect(progress.isCompleted('q1')).toBe(true);
    });

    it('clears every completion when confirmed', async () => {
      const { fixture, loader, rootLoader, progress } = await setup();
      progress.setCompleted('q1', true);
      const resetButton = await loader.getHarness(
        MatButtonHarness.with({ text: /Desmarcar todo/ }),
      );

      await resetButton.click();
      const confirmButton = await rootLoader.getHarness(
        MatButtonHarness.with({ text: 'Desmarcar', ancestor: 'mat-dialog-container' }),
      );
      await confirmButton.click();
      await fixture.whenStable();

      const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);

      expect(dialogs).toHaveLength(0);
      expect(progress.completedQuests()).toEqual({});
    });
  });
});
