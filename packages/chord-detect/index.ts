import { all, ChordType } from "@tonaljs/chord-type";
import { note } from "@tonaljs/core";
import { modes } from "@tonaljs/pcset";

interface FoundChord {
  readonly weight: number;
  readonly name: string;
}

const namedSet = (notes: string[]) => {
  const pcToName = notes.reduce<Record<number, string>>((record, n) => {
    const chroma = note(n).chroma;
    if (chroma !== undefined) {
      record[chroma] = record[chroma] || note(n).name;
    }
    return record;
  }, {});

  return (chroma: number) => pcToName[chroma];
};

export function detect(source: string[], assumePerfectFifth: boolean = false): string[] {
  const notes = source.map((n) => note(n).pc).filter((x) => x);
  if (note.length === 0) {
    return [];
  }

  const found: FoundChord[] = findExactMatches(notes, 1, assumePerfectFifth);

  return found
    .filter((chord) => chord.weight)
    .sort((a, b) => b.weight - a.weight)
    .map((chord) => chord.name);
}

// 3m 000100000000
// 3M 000010000000
// 5d 000000100000
// 5P 000000010000
// 5A 000000001000
// 7m 000000000010
// 7M 000000000001
function has3x_5P_7x(chordType: ChordType) {
  const cromaNum = parseInt(chordType.chroma, 2)
  return ((cromaNum & 384) && (cromaNum & 16) && (cromaNum & 3))

  /*return (chordType.intervals.some(interval => ['3M', '3m'].includes(interval))) &&
  (chordType.intervals.some(interval => ['5P'].includes(interval))) &&
  (chordType.intervals.some(interval => ['7M', '7m'].includes(interval)))*/
}

function maybeAddPerfectFifth(chroma: string): string {
  const cromaNum = parseInt(chroma, 2)
  return (cromaNum & 40)? chroma : (cromaNum | 16).toString(2)

  /*if(str[6] === '1' || str[8] === '1')
    return str
  const ret = str.split('');
  ret[7] = '1';
  return ret.join('');*/
}

function findExactMatches(notes: string[], weight: number, assumePerfectFifth: boolean = false): FoundChord[] {
  const tonic = notes[0];
  const tonicChroma = note(tonic).chroma;
  const noteName = namedSet(notes);
  // we need to test all chormas to get the correct baseNote
  const allModes = modes(notes, false);

  const found: FoundChord[] = [];
  allModes.forEach((mode, index) => {
    const assumedMode = maybeAddPerfectFifth(mode)
    // some chords could have the same chroma but different interval spelling
    const chordTypes = all().filter((chordType) => {
      if(assumePerfectFifth && has3x_5P_7x(chordType)) {
        return chordType.chroma === assumedMode
      }
      return chordType.chroma === mode
    });

    chordTypes.forEach((chordType) => {
      const chordName = chordType.aliases[0];
      const baseNote = noteName(index);
      const isInversion = index !== tonicChroma;
      if (isInversion) {
        found.push({
          weight: 0.5 * weight,
          name: `${baseNote}${chordName}/${tonic}`,
        });
      } else {
        found.push({ weight: 1 * weight, name: `${baseNote}${chordName}` });
      }
    });
  });

  return found;
}

export default { detect };
