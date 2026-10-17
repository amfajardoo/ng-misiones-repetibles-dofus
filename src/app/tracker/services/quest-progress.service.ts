import { afterNextRender, inject, Injectable, signal } from '@angular/core';
import { QuestProgressStorageService } from './quest-progress-storage.service';

/**
 * In-memory completion state for repeatable quests.
 * Persistence is delegated to QuestProgressStorageService.
 */
@Injectable({ providedIn: 'root' })
export class QuestProgressService {
  private readonly storage = inject(QuestProgressStorageService);
  private readonly completionByQuestId = signal<Record<string, boolean>>({});

  /** Read-only view of the quest completion map (questId → completed). */
  readonly completedQuests = this.completionByQuestId.asReadonly();

  constructor() {
    afterNextRender(() => {
      const stored = this.storage.load();
      if (stored) {
        this.completionByQuestId.set(stored);
      }
    });
  }

  isCompleted(questId: string): boolean {
    return this.completionByQuestId()[questId] === true;
  }

  setCompleted(questId: string, completed: boolean): void {
    this.completionByQuestId.update((current) => ({
      ...current,
      [questId]: completed,
    }));
    this.storage.save(this.completionByQuestId());
  }

  clearAll(): void {
    this.completionByQuestId.set({});
    this.storage.save(this.completionByQuestId());
  }
}
