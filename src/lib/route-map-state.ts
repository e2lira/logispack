/**
 * Pure state machine for the illustrative route-map popup (RFC 0001).
 *
 * The DOM island translates browser events into `RouteMapEvent`s and applies the
 * resulting state; nothing here touches the DOM or timers. `closePending` tells
 * the island to start the short bridge delay and then dispatch `delay-elapsed`.
 */

/** Pause (ms) that bridges the pointer or focus travel between marker and popup. */
export const CLOSE_DELAY_MS = 150;

export interface RouteMapState {
  readonly open: boolean;
  /** Opened by a deliberate touch tap: presence does not auto-close it. */
  readonly pinned: boolean;
  readonly markerHover: boolean;
  /** Keyboard (focus-visible) focus only; pointer-originated focus is not presence. */
  readonly markerFocus: boolean;
  readonly popupHover: boolean;
  readonly popupFocus: boolean;
  /** After a dismissal: blocks hover reopen until the pointer leaves the region. */
  readonly hoverLatch: boolean;
  /** After a dismissal: blocks focus reopen until the marker blurs. */
  readonly focusLatch: boolean;
  readonly closePending: boolean;
}

export type RouteMapEvent =
  | { readonly type: 'marker-enter' }
  | { readonly type: 'marker-leave' }
  | { readonly type: 'popup-enter' }
  | { readonly type: 'popup-leave' }
  | { readonly type: 'marker-focus'; readonly visible: boolean }
  | { readonly type: 'marker-blur' }
  | { readonly type: 'popup-focus'; readonly visible: boolean }
  | { readonly type: 'popup-blur' }
  | {
      readonly type: 'activate';
      readonly source: 'mouse' | 'touch' | 'keyboard';
    }
  | { readonly type: 'escape' }
  | { readonly type: 'close' }
  | { readonly type: 'outside' }
  | { readonly type: 'delay-elapsed' };

export const initialState: RouteMapState = {
  open: false,
  pinned: false,
  markerHover: false,
  markerFocus: false,
  popupHover: false,
  popupFocus: false,
  hoverLatch: false,
  focusLatch: false,
  closePending: false,
};

export function isPresent(s: RouteMapState): boolean {
  return s.markerHover || s.markerFocus || s.popupHover || s.popupFocus;
}

/** Recompute whether an auto-close should be scheduled. */
function settle(s: RouteMapState): RouteMapState {
  const closePending = s.open && !s.pinned && !isPresent(s);
  return closePending === s.closePending ? s : { ...s, closePending };
}

/** Close and arm the latches for whichever input channel is currently engaged. */
function dismiss(s: RouteMapState): RouteMapState {
  return {
    ...s,
    open: false,
    pinned: false,
    closePending: false,
    hoverLatch: s.markerHover || s.popupHover,
    focusLatch: s.markerFocus || s.popupFocus,
  };
}

/** Close without arming a latch (outside tap, bridge delay elapsed). */
function release(s: RouteMapState): RouteMapState {
  return { ...s, open: false, pinned: false, closePending: false };
}

export function reduce(s: RouteMapState, e: RouteMapEvent): RouteMapState {
  switch (e.type) {
    case 'marker-enter':
      return settle({
        ...s,
        markerHover: true,
        open: s.open || !s.hoverLatch,
      });
    case 'marker-leave': {
      const next = { ...s, markerHover: false };
      return settle(next.popupHover ? next : { ...next, hoverLatch: false });
    }
    case 'popup-enter':
      return settle({ ...s, popupHover: true });
    case 'popup-leave': {
      const next = { ...s, popupHover: false };
      return settle(next.markerHover ? next : { ...next, hoverLatch: false });
    }
    case 'marker-focus':
      return settle({
        ...s,
        markerFocus: e.visible,
        open: s.open || (e.visible && !s.focusLatch),
      });
    case 'marker-blur':
      return settle({ ...s, markerFocus: false, focusLatch: false });
    case 'popup-focus':
      return settle({ ...s, popupFocus: e.visible });
    case 'popup-blur':
      return settle({ ...s, popupFocus: false });
    case 'activate':
      if (!s.open) {
        return settle({
          ...s,
          open: true,
          pinned: e.source === 'touch',
          // Enter/Space (or a screen reader) can only act on the focused marker
          markerFocus: s.markerFocus || e.source === 'keyboard',
          hoverLatch: false,
          focusLatch: false,
        });
      }
      return e.source === 'mouse' ? s : dismiss(s);
    case 'escape':
    case 'close':
      return s.open ? dismiss(s) : s;
    case 'outside':
      return s.open ? release(s) : s;
    case 'delay-elapsed':
      return s.closePending && s.open && !isPresent(s) ? release(s) : s;
  }
}
