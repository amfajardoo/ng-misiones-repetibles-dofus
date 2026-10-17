import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

const STORAGE_KEY = 'dofus_rep_v2';

/**
 * Persistence adapter for quest completion state.
 * Isolates localStorage access from the rest of the app.
 */
@Injectable({ providedIn: 'root' })
export class QuestProgressStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Returns the stored completion map, or null when unavailable/corrupted. */
  load(): Record<string, boolean> | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, boolean>;
      }
      return null;
    } catch {
      return null;
    }
  }

  save(completionByQuestId: Record<string, boolean>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completionByQuestId));
    } catch {
      // storage full or unavailable — caller keeps state in memory
    }
  }
}
