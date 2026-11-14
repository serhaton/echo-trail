import * as Haptics from 'expo-haptics';

/**
 * Central haptics service.
 *
 * All vibration goes through here so the "vibration on/off" setting
 * (stage 11) can mute everything in one place, and so game code reads as
 * intent ("bump", "tick") rather than raw Haptics API calls.
 */

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

/** Light tick for UI buttons and selections. */
export function uiTap(): void {
  if (enabled) void Haptics.selectionAsync();
}

/** Player bumped into an obstacle. */
export function bump(): void {
  if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Soft pulse used during the last 10 seconds of the countdown. */
export function countdownPulse(): void {
  if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
}

/** Picked up a hidden sound. */
export function collect(): void {
  if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Caught by the chaser / level lost. */
export function failure(): void {
  if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Level completed. */
export function success(): void {
  if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
