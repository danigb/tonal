import { all } from "@tonaljs/chord-type";
import { note, distance } from "@tonaljs/core";
import { name, sortedNames } from "@tonaljs/note";
import { simplify } from "@tonaljs/interval";
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

export function detect(source: string[]): string[] {
  const notes = sortedNames(source)
    .map((n) => note(n).pc)
    .filter((x) => x);
  if (note.length === 0) {
    return [];
  }

  const found: FoundChord[] = findExactMatches(notes, 1);

  return found
    .filter((chord) => chord.weight)
    .sort((a, b) => b.weight - a.weight)
    .map((chord) => chord.name);
}

// Assumes that chord is presorted
function findRoot(chord: string[]): string {
  let foundRoot = null;
  chord.every((note) => {
    const workComplete = chord.some((otherNote) => {
      const interval = simplify(distance(note, otherNote));
      const orderedNotes = sortedNames([note, otherNote]);
      if (interval === "5P") {
        foundRoot = orderedNotes[0];
        return foundRoot; // Loop is complete
      } else if (interval === "4P") {
        foundRoot = orderedNotes[1];
        return foundRoot; // Loop is complete
      }
      return false; // continue looping
    });
    // Continue looping if the root note was not found
    return !workComplete;
  });
  if (foundRoot) {
    return foundRoot;
  } else {
    // Defaults to the old behavior if the chord is complex and the root note cannot be easily found
    return chord[0];
  }
}

// assumes that notes is presorted
function findExactMatches(notes: string[], weight: number): FoundChord[] {
  const root = findRoot(notes);
  const noteName = namedSet(notes);
  // we need to test all chromas to get the correct baseNote
  const allModes = modes(notes, false);
  const baseNote = notes[0];
  const baseChroma = note(baseNote).chroma;

  const found: FoundChord[] = [];
  allModes.forEach((mode, index) => {
    // some chords could have the same chroma but different interval spelling
    const chordTypes = all().filter((chordType) => chordType.chroma === mode);

    chordTypes.forEach((chordType) => {
      const chordName = chordType.aliases[0];
      const rootNote = noteName(index);
      const isInversion = note(rootNote).chroma !== baseChroma;

      if (isInversion) {
        found.push({
          weight: 0.5 * weight,
          name: `${rootNote}${chordName}/${baseNote}`,
        });
      } else {
        found.push({ weight: 1 * weight, name: `${root}${chordName}` });
      }
    });
  });

  return found;
}

export default { detect };
