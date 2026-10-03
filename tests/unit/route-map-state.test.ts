import { describe, expect, it } from 'vitest';
import {
  initialState,
  isPresent,
  reduce,
  type RouteMapEvent,
  type RouteMapState,
} from '../../src/lib/route-map-state';

const run = (events: RouteMapEvent[], from: RouteMapState = initialState) =>
  events.reduce(reduce, from);

describe('initial state', () => {
  it('starts closed, unpinned, with no latch and no presence', () => {
    expect(initialState.open).toBe(false);
    expect(initialState.pinned).toBe(false);
    expect(initialState.hoverLatch).toBe(false);
    expect(initialState.focusLatch).toBe(false);
    expect(initialState.closePending).toBe(false);
    expect(isPresent(initialState)).toBe(false);
  });
});

describe('fine pointer hover', () => {
  it('opens when the pointer enters the marker', () => {
    expect(run([{ type: 'marker-enter' }]).open).toBe(true);
  });

  it('keeps the popup open while the pointer travels marker to popup', () => {
    const s = run([
      { type: 'marker-enter' },
      { type: 'marker-leave' },
      { type: 'popup-enter' },
      { type: 'delay-elapsed' },
    ]);
    expect(s.open).toBe(true);
    expect(s.closePending).toBe(false);
  });

  it('schedules a close when both surfaces lose presence and closes after the delay', () => {
    const left = run([{ type: 'marker-enter' }, { type: 'marker-leave' }]);
    expect(left.open).toBe(true);
    expect(left.closePending).toBe(true);
    expect(reduce(left, { type: 'delay-elapsed' }).open).toBe(false);
  });

  it('cancels the pending close when presence returns before the delay', () => {
    const s = run([
      { type: 'marker-enter' },
      { type: 'marker-leave' },
      { type: 'popup-enter' },
    ]);
    expect(s.closePending).toBe(false);
    expect(reduce(s, { type: 'delay-elapsed' }).open).toBe(true);
  });

  it('ignores a stale delay when nothing is pending', () => {
    expect(reduce(initialState, { type: 'delay-elapsed' }).open).toBe(false);
  });
});

describe('keyboard focus', () => {
  it('opens on keyboard focus of the marker', () => {
    expect(run([{ type: 'marker-focus', visible: true }]).open).toBe(true);
  });

  it('does not open on pointer-originated focus', () => {
    const s = run([{ type: 'marker-focus', visible: false }]);
    expect(s.open).toBe(false);
    expect(isPresent(s)).toBe(false);
  });

  it('keeps the popup open when focus moves from marker to the close control', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'marker-blur' },
      { type: 'popup-focus', visible: true },
      { type: 'delay-elapsed' },
    ]);
    expect(s.open).toBe(true);
  });

  it('closes after focus leaves both marker and popup', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'marker-blur' },
      { type: 'delay-elapsed' },
    ]);
    expect(s.open).toBe(false);
  });
});

describe('dismissal and suppression latch', () => {
  it('Escape closes and sets the focus latch when the marker had focus', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'escape' },
    ]);
    expect(s.open).toBe(false);
    expect(s.focusLatch).toBe(true);
  });

  it('a new focus event does not reopen while the focus latch is set', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'escape' },
      { type: 'marker-focus', visible: true },
    ]);
    expect(s.open).toBe(false);
  });

  it('blur clears the focus latch so a fresh focus reopens', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'escape' },
      { type: 'marker-blur' },
      { type: 'marker-focus', visible: true },
    ]);
    expect(s.open).toBe(true);
  });

  it('close from the popup latches focus so restoring focus to the marker does not reopen', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'marker-blur' },
      { type: 'popup-focus', visible: true },
      { type: 'close' },
      { type: 'popup-blur' },
      { type: 'marker-focus', visible: true },
    ]);
    expect(s.open).toBe(false);
    expect(s.focusLatch).toBe(true);
  });

  it('hover latch blocks reopening until the pointer leaves the region and re-enters', () => {
    const closed = run([{ type: 'marker-enter' }, { type: 'escape' }]);
    expect(closed.open).toBe(false);
    expect(closed.hoverLatch).toBe(true);
    // the pointer never left the region: moving marker -> popup -> marker keeps it closed
    const stillInside = run(
      [
        { type: 'popup-enter' },
        { type: 'marker-leave' },
        { type: 'marker-enter' },
      ],
      closed,
    );
    expect(stillInside.open).toBe(false);
    expect(stillInside.hoverLatch).toBe(true);
  });

  it('hover latch clears once the pointer left both surfaces', () => {
    const s = run([
      { type: 'marker-enter' },
      { type: 'close' },
      { type: 'marker-leave' },
      { type: 'marker-enter' },
    ]);
    expect(s.open).toBe(true);
  });

  it('does not set a hover latch when the pointer is outside at dismissal', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'escape' },
    ]);
    expect(s.hoverLatch).toBe(false);
  });

  it('does not set a stale focus latch when neither marker nor popup had focus', () => {
    const s = run([{ type: 'marker-enter' }, { type: 'escape' }]);
    expect(s.focusLatch).toBe(false);
  });

  it('escape and close are no-ops while closed', () => {
    expect(reduce(initialState, { type: 'escape' })).toEqual(initialState);
    expect(reduce(initialState, { type: 'close' })).toEqual(initialState);
  });
});

describe('coarse pointer and activation', () => {
  it('a touch tap opens and pins the popup', () => {
    const s = run([{ type: 'activate', source: 'touch' }]);
    expect(s.open).toBe(true);
    expect(s.pinned).toBe(true);
  });

  it('a pinned popup does not auto-close without presence', () => {
    const s = run([
      { type: 'activate', source: 'touch' },
      { type: 'delay-elapsed' },
    ]);
    expect(s.open).toBe(true);
  });

  it('a second tap on the marker dismisses and stays closed', () => {
    const s = run([
      { type: 'activate', source: 'touch' },
      { type: 'activate', source: 'touch' },
    ]);
    expect(s.open).toBe(false);
    expect(s.pinned).toBe(false);
  });

  it('touch dismissal is not reopened by a focus event', () => {
    const s = run([
      { type: 'activate', source: 'touch' },
      { type: 'marker-focus', visible: false },
      { type: 'close' },
      { type: 'marker-focus', visible: false },
    ]);
    expect(s.open).toBe(false);
  });

  it('an outside tap closes without a latch', () => {
    const s = run([{ type: 'activate', source: 'touch' }, { type: 'outside' }]);
    expect(s.open).toBe(false);
    expect(s.hoverLatch).toBe(false);
    expect(s.focusLatch).toBe(false);
  });

  it('a deliberate activation reopens through a latch', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'escape' },
      { type: 'activate', source: 'keyboard' },
    ]);
    expect(s.open).toBe(true);
    expect(s.focusLatch).toBe(false);
    expect(s.hoverLatch).toBe(false);
  });

  it('keyboard activation toggles an open popup closed with a latch', () => {
    const s = run([
      { type: 'marker-focus', visible: true },
      { type: 'activate', source: 'keyboard' },
    ]);
    expect(s.open).toBe(false);
    expect(s.focusLatch).toBe(true);
  });

  it('a mouse click on an already open popup keeps it open', () => {
    const s = run([
      { type: 'marker-enter' },
      { type: 'activate', source: 'mouse' },
    ]);
    expect(s.open).toBe(true);
  });

  it('an outside event is a no-op while closed', () => {
    expect(reduce(initialState, { type: 'outside' })).toEqual(initialState);
  });
});
