import { detect } from "@tonaljs/chord-detect";
import {
  all as chordTypes,
  ChordType,
  get as getChordType,
} from "@tonaljs/chord-type";

import {
  deprecate,
  distance,
  note,
  NoteName,
  tokenizeNote,
  transpose as transposeNote,
} from "@tonaljs/core";

import { isSubsetOf, isSupersetOf } from "@tonaljs/pcset";
import { semitones, simplify } from "@tonaljs/interval";
import { all as scaleTypes } from "@tonaljs/scale-type";
export { detect } from "@tonaljs/chord-detect";

type ChordName = string;
type ChordNameTokens = [string, string]; // [TONIC, SCALE TYPE]

export interface Chord extends ChordType {
  tonic: string | null;
  type: string;
  root: string;
  rootDegree: number;
  symbol: string;
  notes: NoteName[];
}

const NoChord: Chord = {
  empty: true,
  name: "",
  symbol: "",
  root: "",
  rootDegree: 0,
  type: "",
  tonic: null,
  setNum: NaN,
  quality: "Unknown",
  chroma: "",
  normalized: "",
  aliases: [],
  notes: [],
  intervals: [],
};

// 6, 64, 7, 9, 11 and 13 are consider part of the chord
// (see https://github.com/danigb/tonal/issues/55)
const NUM_TYPES = /^(6|64|7|9|11|13)$/;
/**
 * Tokenize a chord name. It returns an array with the tonic and chord type
 * If not tonic is found, all the name is considered the chord name.
 *
 * This function does NOT check if the chord type exists or not. It only tries
 * to split the tonic and chord type.
 *
 * @function
 * @param {string} name - the chord name
 * @return {Array} an array with [tonic, type]
 * @example
 * tokenize("Cmaj7") // => [ "C", "maj7" ]
 * tokenize("C7") // => [ "C", "7" ]
 * tokenize("mMaj7") // => [ null, "mMaj7" ]
 * tokenize("Cnonsense") // => [ null, "nonsense" ]
 */
export function tokenize(name: string): ChordNameTokens {
  const [letter, acc, oct, type] = tokenizeNote(name);
  if (letter === "") {
    return ["", name];
  }
  // aug is augmented (see https://github.com/danigb/tonal/issues/55)
  if (letter === "A" && type === "ug") {
    return ["", "aug"];
  }
  // see: https://github.com/tonaljs/tonal/issues/70
  if (!type && (oct === "4" || oct === "5")) {
    return [letter + acc, oct];
  }

  if (NUM_TYPES.test(oct)) {
    return [letter + acc, oct + type];
  } else {
    return [letter + acc + oct, type];
  }
}

/**
 * Get a Chord from a chord name.
 */
export function get(src: ChordName | ChordNameTokens): Chord {
  if (src === "") {
    return NoChord;
  }
  if (Array.isArray(src) && src.length === 2) {
    return getChord(src[1], src[0]);
  } else {
    const [tonic, type] = tokenize(src);
    const chord = getChord(type, tonic);
    return chord.empty ? getChord(src) : chord;
  }
}

/**
 * Get chord properties
 *
 * @param typeName - the chord type name
 * @param [tonic] - Optional tonic
 * @param [root]  - Optional root (requires a tonic)
 */
export function getChord(
  typeName: string,
  optionalTonic?: string,
  optionalRoot?: string
): Chord {
  const type = getChordType(typeName);
  const tonic = note(optionalTonic || "");
  const root = note(optionalRoot || "");

  if (
    type.empty ||
    (optionalTonic && tonic.empty) ||
    (optionalRoot && root.empty)
  ) {
    return NoChord;
  }

  const rootInterval = semitones(distance(tonic.pc, root.pc));
  const rootDegree = type.intervals.map(i => semitones(simplify(i))).indexOf(rootInterval) + 1;
  if (!root.empty && !rootDegree) {
    return NoChord;
  }

  const intervals = Array.from(type.intervals);

  for (let i = 1; i < rootDegree; i++) {
    const num = intervals[0][0];
    const quality = intervals[0][1];
    const newNum = parseInt(num, 10) + 7;
    intervals.push(`${newNum}${quality}`);
    intervals.shift();
  }

  const notes = tonic.empty
    ? []
    : intervals.map((i) => transposeNote(tonic, i));

  typeName = type.aliases.indexOf(typeName) !== -1 ? typeName : type.aliases[0];
  const symbol = `${tonic.empty ? "" : tonic.pc}${typeName}${
    root.empty || rootDegree <= 1 ? "" : "/" + root.pc
  }`;
  const name = `${optionalTonic ? tonic.pc + " " : ""}${type.name}${
    rootDegree > 1 && optionalRoot ? " over " + root.pc : ""
  }`;
  return {
    ...type,
    name,
    symbol,
    type: type.name,
    root: root.name,
    intervals,
    rootDegree,
    tonic: tonic.name,
    notes,
  };
}

export const chord = deprecate("Chord.chord", "Chord.get", get);

/**
 * Transpose a chord name
 *
 * @param {string} chordName - the chord name
 * @return {string} the transposed chord
 *
 * @example
 * transpose('Dm7', 'P4') // => 'Gm7
 */
export function transpose(chordName: string, interval: string): string {
  const [tonic, type] = tokenize(chordName);
  if (!tonic) {
    return chordName;
  }
  return transposeNote(tonic, interval) + type;
}

/**
 * Get all scales where the given chord fits
 *
 * @example
 * chordScales('C7b9')
 * // => ["phrygian dominant", "flamenco", "spanish heptatonic", "half-whole diminished", "chromatic"]
 */
export function chordScales(name: string): string[] {
  const s = get(name);
  const isChordIncluded = isSupersetOf(s.chroma);
  return scaleTypes()
    .filter((scale) => isChordIncluded(scale.chroma))
    .map((scale) => scale.name);
}
/**
 * Get all chords names that are a superset of the given one
 * (has the same notes and at least one more)
 *
 * @function
 * @example
 * extended("CMaj7")
 * // => [ 'Cmaj#4', 'Cmaj7#9#11', 'Cmaj9', 'CM7add13', 'Cmaj13', 'Cmaj9#11', 'CM13#11', 'CM7b9' ]
 */
export function extended(chordName: string): string[] {
  const s = get(chordName);
  const isSuperset = isSupersetOf(s.chroma);
  return chordTypes()
    .filter((chord) => isSuperset(chord.chroma))
    .map((chord) => s.tonic + chord.aliases[0]);
}

/**
 * Find all chords names that are a subset of the given one
 * (has less notes but all from the given chord)
 *
 * @example
 */
export function reduced(chordName: string): string[] {
  const s = get(chordName);
  const isSubset = isSubsetOf(s.chroma);
  return chordTypes()
    .filter((chord) => isSubset(chord.chroma))
    .map((chord) => s.tonic + chord.aliases[0]);
}

export default {
  getChord,
  get,
  detect,
  chordScales,
  extended,
  reduced,
  tokenize,
  transpose,
  // deprecate
  chord,
};
