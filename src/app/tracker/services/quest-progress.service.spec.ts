import { TestBed } from '@angular/core/testing';
import { QuestProgressService } from './quest-progress.service';
import { QuestProgressStorageService } from './quest-progress-storage.service';

describe('QuestProgressService', () => {
  let service: QuestProgressService;
  const storageStub = {
    load: vi.fn<() => Record<string, boolean> | null>(() => null),
    save: vi.fn<(completion: Record<string, boolean>) => void>(),
  } satisfies Pick<QuestProgressStorageService, 'load' | 'save'>;

  beforeEach(() => {
    storageStub.load.mockReturnValue(null);
    storageStub.save.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: QuestProgressStorageService, useValue: storageStub },
      ],
    });
    service = TestBed.inject(QuestProgressService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isCompleted', () => {
    it('returns false for an unknown quest', () => {
      expect(service.isCompleted('missing')).toBe(false);
    });

    it('returns true after setCompleted(true)', () => {
      service.setCompleted('q1', true);

      expect(service.isCompleted('q1')).toBe(true);
    });

    it('returns false after setCompleted(false)', () => {
      service.setCompleted('q1', true);
      service.setCompleted('q1', false);

      expect(service.isCompleted('q1')).toBe(false);
    });
  });

  describe('setCompleted', () => {
    it('persists the updated map through the storage service', () => {
      service.setCompleted('q1', true);

      expect(storageStub.save).toHaveBeenCalledWith({ q1: true });
    });

    it('keeps other completions when toggling one quest', () => {
      service.setCompleted('q1', true);
      service.setCompleted('q2', true);

      expect(service.completedQuests()).toEqual({ q1: true, q2: true });
    });
  });

  describe('clearAll', () => {
    it('removes every completion and persists the empty map', () => {
      service.setCompleted('q1', true);

      service.clearAll();

      expect(service.completedQuests()).toEqual({});
      expect(storageStub.save).toHaveBeenLastCalledWith({});
    });
  });
});
