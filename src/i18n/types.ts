import type { en } from './en';

/** Languages the game ships with. Add a code here + a file to add a language. */
export type Language = 'tr' | 'en';

/** The user's choice: follow the device language, or force one. */
export type LanguagePreference = 'system' | Language;

/** Recursively turns the literal string types of `en` into plain `string`. */
type Widen<T> = { readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** Shape every translation file must satisfy. */
export type Translation = Widen<typeof en>;

/** Dot-separated paths to leaf strings, e.g. "menu.play" | "modes.zen.name". */
type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Paths<Translation>;

/** Ids of story fragments (Mystery collectibles), e.g. "s01". */
export type StoryId = keyof Translation['stories'];

/** Values for {{placeholder}} interpolation. */
export type TranslationParams = Record<string, string | number>;
