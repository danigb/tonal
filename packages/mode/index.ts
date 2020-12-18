import { rotate } from "@tonaljs/collection";
import { deprecate, isPitch, Named, NoteName, transpose } from "@tonaljs/core";
import { transposeFifths, simplify } from "@tonaljs/interval";
import { chromaToIntervals, EmptyPcset, Pcset } from "@tonaljs/pcset";

const MODES = [
  [0, 2773, 0, "ionian", "", "Maj7", "Maj9", "major"],
  [1, 2902, 2, "dorian", "m", "m7", "m9"],
  [2, 3418, 4, "phrygian", "m", "m7", "m9"],
  [3, 2741, -1, "lydian", "", "Maj7", "Maj9"],
  [4, 2774, 1, "mixolydian", "", "7", "9"],
  [5, 2906, 3, "aeolian", "m", "m7", "m9", "minor"],
  [6, 3434, 5, "locrian", "dim", "m7b5", "M6#11", ""],
] as const;

type ModeDatum = typeof MODES[number];

export interface Mode extends Pcset {
  readonly name: string;
  readonly modeNum: number;
  readonly alt: number; // number of alterations === number of fiths
  readonly triad: string;
  readonly seventh: string;
  readonly ninth: string;
  readonly aliases: string[];
}

const NoMode: Mode = {
  ...EmptyPcset,
  name: "",
  alt: 0,
  modeNum: NaN,
  triad: "",
  seventh: "",
  ninth: "",
  aliases: [],
};

const modes: Mode[] = MODES.map(toMode);
const index: Record<string, Mode> = {};
modes.forEach((mode) => {
  index[mode.name] = mode;
  mode.aliases.forEach((alias) => {
    index[alias] = mode;
  });
});

type ModeLiteral = string | Named;

/**
 * Get a Mode by it's name
 *
 * @example
 * get('dorian')
 * // =>
 * // {
 * //   intervals: [ '1P', '2M', '3m', '4P', '5P', '6M', '7m' ],
 * //   modeNum: 1,
 * //   chroma: '101101010110',
 * //   normalized: '101101010110',
 * //   name: 'dorian',
 * //   setNum: 2902,
 * //   alt: 2,
 * //   triad: 'm',
 * //   seventh: 'm7',
 * //   ninth: 'm9',
 * //   aliases: []
 * // }
 */
export function get(name: ModeLiteral): Mode {
  return typeof name === "string"
    ? index[name.toLowerCase()] || NoMode
    : name && name.name
    ? get(name.name)
    : NoMode;
}

export const mode = deprecate("Mode.mode", "Mode.get", get);

/**
 * Get a list of all modes
 */
export function all() {
  return modes.slice();
}
export const entries = deprecate("Mode.mode", "Mode.all", all);

/**
 * Get a list of all mode names
 */
export function names() {
  return modes.map((mode) => mode.name);
}

function toMode(mode: ModeDatum): Mode {
  const [modeNum, setNum, alt, name, triad, seventh, ninth, alias] = mode;
  const aliases = alias ? [alias] : [];
  const chroma = Number(setNum).toString(2);
  const intervals = chromaToIntervals(chroma);
  return {
    empty: false,
    intervals,
    modeNum,
    chroma,
    normalized: chroma,
    name,
    setNum,
    alt,
    triad,
    seventh,
    ninth,
    aliases,
  };
}

export function notes(modeName: ModeLiteral, tonic: NoteName) {
  return get(modeName).intervals.map((ivl) => transpose(tonic, ivl));
}

function chords(chords: string[]) {
  return (modeName: ModeLiteral, tonic: NoteName) => {
    const mode = get(modeName);
    if (mode.empty) return [];
    const triads = rotate(mode.modeNum, chords);
    const tonics = mode.intervals.map((i) => transpose(tonic, i));
    return triads.map((triad, i) => tonics[i] + triad);
  };
}

export const triads = chords(MODES.map((x) => x[4]));
export const seventhChords = chords(MODES.map((x) => x[5]));
export const ninthChords = chords(MODES.map((x) => x[6]));

export function distance(destination: ModeLiteral, source: ModeLiteral) {
  const from = get(source);
  const to = get(destination);
  if (from.empty || to.empty) return "";
  return simplify(transposeFifths("1P", to.alt - from.alt));
}

export function relativeTonic(
  destination: ModeLiteral,
  source: ModeLiteral,
  tonic: NoteName
) {
  return transpose(tonic, distance(destination, source));
}

export default {
  get,
  names,
  all,
  distance,
  relativeTonic,
  notes,
  triads,
  seventhChords,
  ninthChords,
  // deprecated
  entries,
  mode,
};
