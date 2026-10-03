/**
 * Route-map island (RFC 0001). Progressive enhancement only: the server-rendered
 * section already shows the map, a static marker and the sample data. This script
 * turns the static marker into a button that opens a non-modal popup. All
 * decisions live in the pure reducer in src/lib/route-map-state.ts.
 *
 * Single-instance by design: the markup uses fixed ids (rm-text, rm-popup) and
 * every instance would register its own document-level listeners.
 */
import {
  CLOSE_DELAY_MS,
  initialState,
  reduce,
  type RouteMapEvent,
  type RouteMapState,
} from '../lib/route-map-state';

/** Space between the marker and the popup, in px. */
const GAP = 14;

const isHoverPointer = (e: PointerEvent) =>
  e.pointerType === 'mouse' || e.pointerType === 'pen';

function enhance(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('[data-rm-stage]');
  const placeholder = root.querySelector<HTMLElement>('[data-rm-marker]');
  const popup = root.querySelector<HTMLElement>('[data-rm-popup]');
  const closeButton = root.querySelector<HTMLElement>('[data-rm-close]');
  if (!stage || !placeholder || !popup || !closeButton) return;

  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = placeholder.className;
  marker.setAttribute('aria-label', placeholder.dataset['label'] ?? '');
  marker.setAttribute('aria-describedby', 'rm-text');
  marker.setAttribute('aria-expanded', 'false');
  marker.setAttribute('aria-controls', popup.id);
  marker.append(...placeholder.childNodes);
  placeholder.replaceWith(marker);

  let state: RouteMapState = initialState;
  let timer: number | undefined;
  let lastPointerType = 'mouse';
  let restoring: boolean | undefined;

  function position(): void {
    const s = stage!.getBoundingClientRect();
    const m = marker.getBoundingClientRect();
    popup!.classList.remove('rm-pop--flow');
    popup!.style.left = '';
    popup!.style.top = '';
    const { offsetWidth: w, offsetHeight: h } = popup!;
    const clamp = (value: number, max: number) =>
      Math.min(Math.max(value, 0), Math.max(0, max));
    // Marker centre in stage coordinates
    const cx = m.left + m.width / 2 - s.left;
    const cy = m.top + m.height / 2 - s.top;
    const room = {
      right: s.width - (cx + m.width / 2) - GAP,
      left: cx - m.width / 2 - GAP,
    };
    if (room.right < w && room.left < w) {
      // Narrow stage: no room beside the marker, so the popup sits in flow
      // below the map instead of covering it or the text around it
      popup!.classList.add('rm-pop--flow');
      return;
    }
    // Wide stage: sit beside the marker so the map and heading stay uncovered
    const left =
      room.right >= w ? cx + m.width / 2 + GAP : cx - m.width / 2 - GAP - w;
    const top = clamp(cy - h / 2, s.height - h);
    popup!.style.left = `${Math.round(left)}px`;
    popup!.style.top = `${Math.round(top)}px`;
  }

  function render(): void {
    popup!.hidden = !state.open;
    marker.setAttribute('aria-expanded', String(state.open));
    root.dataset['state'] = state.open ? 'open' : 'closed';
    if (state.open) position();
  }

  function dispatch(event: RouteMapEvent): void {
    const wasOpen = state.open;
    state = reduce(state, event);
    if (state.closePending && timer === undefined) {
      timer = window.setTimeout(() => {
        timer = undefined;
        dispatch({ type: 'delay-elapsed' });
      }, CLOSE_DELAY_MS);
    } else if (!state.closePending && timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    if (state.open !== wasOpen) render();
  }

  /** Escape / close: dismiss, then give focus back to the marker if it was in the popup. */
  function dismiss(type: 'escape' | 'close'): void {
    if (!state.open) return;
    const focusWasInPopup = popup!.contains(document.activeElement);
    const keyboardFocus = state.popupFocus;
    dispatch({ type });
    if (focusWasInPopup) {
      restoring = keyboardFocus;
      marker.focus();
      restoring = undefined;
    }
  }

  marker.addEventListener('pointerenter', (e) => {
    if (isHoverPointer(e)) dispatch({ type: 'marker-enter' });
  });
  marker.addEventListener('pointerleave', (e) => {
    if (isHoverPointer(e)) dispatch({ type: 'marker-leave' });
  });
  popup.addEventListener('pointerenter', (e) => {
    if (isHoverPointer(e)) dispatch({ type: 'popup-enter' });
  });
  popup.addEventListener('pointerleave', (e) => {
    if (isHoverPointer(e)) dispatch({ type: 'popup-leave' });
  });

  marker.addEventListener('focus', () => {
    dispatch({
      type: 'marker-focus',
      visible: restoring ?? marker.matches(':focus-visible'),
    });
  });
  marker.addEventListener('blur', () => dispatch({ type: 'marker-blur' }));
  popup.addEventListener('focusin', (e) => {
    dispatch({
      type: 'popup-focus',
      visible: (e.target as Element).matches(':focus-visible'),
    });
  });
  popup.addEventListener('focusout', (e) => {
    if (!popup.contains(e.relatedTarget as Node | null)) {
      dispatch({ type: 'popup-blur' });
    }
  });

  marker.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
  });
  marker.addEventListener('click', (e) => {
    const source =
      e.detail === 0
        ? 'keyboard'
        : lastPointerType === 'touch'
          ? 'touch'
          : 'mouse';
    dispatch({ type: 'activate', source });
  });

  closeButton.addEventListener('click', () => dismiss('close'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dismiss('escape');
  });
  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target as Node;
      if (!marker.contains(target) && !popup.contains(target)) {
        dispatch({ type: 'outside' });
      }
    },
    true,
  );
  window.addEventListener('resize', () => {
    if (state.open) position();
  });
}

document
  .querySelectorAll<HTMLElement>('[data-route-map]')
  .forEach((root) => enhance(root));
