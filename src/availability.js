// Smart Campus — room availability (Practice #06/#07/#08)
// User story: As a student, I want to check a room's availability
// so that I can choose a valid booking time.

export const MAX_DURATION_MIN = 120;

/**
 * Check whether a single room is available for a requested slot.
 * @param {{blocked:boolean}} room
 * @param {{start:Date,end:Date}[]} bookings  existing bookings (must NOT be modified)
 * @param {{start:Date,end:Date}} request
 * @param {Date} now  fixed clock (injected for deterministic tests)
 * @returns {{status:'Available'|'Unavailable', reason?:string}}
 */
export function checkAvailability(room, bookings, request, now) {
  const { start, end } = request;

  // AC1: start must be before end, and not in the past
  if (start >= end) return { status: 'Unavailable', reason: 'Start must be before end' };
  if (start < now) return { status: 'Unavailable', reason: 'Request is in the past' };

  // AC2: maximum duration
  const minutes = (end - start) / 60000;
  if (minutes > MAX_DURATION_MIN) return { status: 'Unavailable', reason: 'Longer than 120 minutes' };

  // AC3: blocked room
  if (room.blocked) return { status: 'Unavailable', reason: 'Room is blocked' };

  // AC4: overlaps
  bookings.sort((a, b) => a.start - b.start); // BUG-B: sorts caller's array in place
  for (const b of bookings) {
    if (overlaps(b, request)) return { status: 'Unavailable', reason: 'Overlaps an existing booking' };
  }

  // AC5
  return { status: 'Available' };
}

export function overlaps(a, b) {
  return a.start < b.end && b.start < a.end; // FIX-A: strict comparison, touching endpoints allowed
}
