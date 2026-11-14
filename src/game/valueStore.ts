import { useSyncExternalStore } from 'react';

/**
 * A tiny observable value. The game loop writes it every frame; only
 * components that read it via `useStoreValue` re-render, and only when the
 * value actually changes (e.g. once per second for the countdown digits).
 */
export class ValueStore<T> {
  private listeners = new Set<() => void>();

  constructor(private value: T) {}

  get = () => this.value;

  set(next: T) {
    if (Object.is(next, this.value)) return;
    this.value = next;
    for (const l of this.listeners) l();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

export function useStoreValue<T>(store: ValueStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
