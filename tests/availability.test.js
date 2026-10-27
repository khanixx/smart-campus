import { describe, it, expect, beforeEach } from 'vitest';
import { checkAvailability } from '../src/availability.js';

// Fixed clock: 2026-10-27 09:00 (Asia/Almaty, UTC+5)
const NOW = new Date('2026-10-27T09:00:00+05:00');
const t = (hhmm) => new Date(`2026-10-27T${hhmm}:00+05:00`);

let room, bookings;
beforeEach(() => {
  // fresh fixtures for every test (fictional bookings)
  room = { id: 'A-301', blocked: false };
  bookings = [
    { id: 'B2', start: t('14:00'), end: t('15:00') },
    { id: 'B1', start: t('10:00'), end: t('11:00') },
  ];
});

describe('AC1 — valid time range', () => {
  it('TC01 rejects start == end', () => {
    expect(checkAvailability(room, bookings, { start: t('12:00'), end: t('12:00') }, NOW).status).toBe('Unavailable');
  });
  it('TC02 rejects start > end', () => {
    expect(checkAvailability(room, bookings, { start: t('13:00'), end: t('12:00') }, NOW).status).toBe('Unavailable');
  });
  it('TC03 rejects a request in the past', () => {
    expect(checkAvailability(room, bookings, { start: t('08:00'), end: t('08:30') }, NOW).status).toBe('Unavailable');
  });
});

describe('AC2 — max duration 120 min', () => {
  it('TC04 allows exactly 120 minutes', () => {
    expect(checkAvailability(room, bookings, { start: t('11:00'), end: t('13:00') }, NOW).status).toBe('Available');
  });
  it('TC05 rejects 121 minutes', () => {
    expect(checkAvailability(room, bookings, { start: t('11:30'), end: t('13:31') }, NOW).status).toBe('Unavailable');
  });
});

describe('AC3 — blocked room', () => {
  it('TC06 rejects a blocked room', () => {
    room.blocked = true;
    expect(checkAvailability(room, bookings, { start: t('12:00'), end: t('13:00') }, NOW).status).toBe('Unavailable');
  });
});

describe('AC4 — overlaps', () => {
  it('TC07 rejects a real overlap', () => {
    expect(checkAvailability(room, bookings, { start: t('10:30'), end: t('11:30') }, NOW).status).toBe('Unavailable');
  });
  it('TC08 allows a booking that starts exactly when another ends', () => {
    expect(checkAvailability(room, bookings, { start: t('11:00'), end: t('12:00') }, NOW).status).toBe('Available');
  });
  it('TC09 allows a booking that ends exactly when another starts', () => {
    expect(checkAvailability(room, bookings, { start: t('13:00'), end: t('14:00') }, NOW).status).toBe('Available');
  });
  it('TC10 allows a free slot', () => {
    expect(checkAvailability(room, bookings, { start: t('16:00'), end: t('17:00') }, NOW).status).toBe('Available');
  });
});

describe('AC5 — no mutation of booking data', () => {
  it('TC11 keeps bookings array order and content unchanged', () => {
    const snapshot = structuredClone(bookings);
    checkAvailability(room, bookings, { start: t('16:00'), end: t('17:00') }, NOW);
    expect(bookings).toEqual(snapshot);
  });
});
