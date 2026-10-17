import { TestBed } from '@angular/core/testing';
import { QuestProgressStorageService } from './quest-progress-storage.service';

const STORAGE_KEY = 'dofus_rep_v2';

describe('QuestProgressStorageService', () => {
  let service: QuestProgressStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestProgressStorageService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('load', () => {
    it('returns null when nothing is stored', () => {
      expect(service.load()).toBeNull();
    });

    it('returns the stored completion map', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ q1: true, q2: false }));

      expect(service.load()).toEqual({ q1: true, q2: false });
    });

    it('returns null when stored JSON is corrupted', () => {
      localStorage.setItem(STORAGE_KEY, '{not-json');

      expect(service.load()).toBeNull();
    });

    it('returns null when stored value is not an object', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));

      expect(service.load()).toBeNull();
    });
  });

  describe('save', () => {
    it('writes the completion map as JSON', () => {
      service.save({ q1: true });

      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ q1: true }));
    });

    it('overwrites previous content', () => {
      service.save({ q1: true });
      service.save({ q2: true });

      expect(service.load()).toEqual({ q2: true });
    });
  });
});
