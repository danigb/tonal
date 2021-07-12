import Chord from "./index";

const $ = (str: string) => str.split(" ");

describe("tonal-chord", () => {
  test("tokenize", () => {
    expect(Chord.tokenize("Cmaj7")).toEqual(["C", "maj7"]);
    expect(Chord.tokenize("c7")).toEqual(["C", "7"]);
    expect(Chord.tokenize("maj7")).toEqual(["", "maj7"]);
    expect(Chord.tokenize("c#4 m7b5")).toEqual(["C#4", "m7b5"]);
    expect(Chord.tokenize("c#4m7b5")).toEqual(["C#4", "m7b5"]);
    expect(Chord.tokenize("Cb7b5")).toEqual(["Cb", "7b5"]);
    expect(Chord.tokenize("Eb7add6")).toEqual(["Eb", "7add6"]);
    expect(Chord.tokenize("Bb6b5")).toEqual(["Bb", "6b5"]);
    expect(Chord.tokenize("aug")).toEqual(["", "aug"]);
    expect(Chord.tokenize("C11")).toEqual(["C", "11"]);
    expect(Chord.tokenize("C13no5")).toEqual(["C", "13no5"]);
    expect(Chord.tokenize("C64")).toEqual(["C", "64"]);
    // see: https://github.com/tonaljs/tonal/issues/70
    expect(Chord.tokenize("C5")).toEqual(["C", "5"]);
    expect(Chord.tokenize("C4")).toEqual(["C", "4"]);
  });

  describe("getChord", () => {
    test("Chord properites", () => {
      expect(Chord.getChord("maj7", "G4", "G4")).toEqual({
        empty: false,
        name: "G major seventh",
        symbol: "Gmaj7",
        tonic: "G4",
        root: "G4",
        rootDegree: 1,
        setNum: 2193,
        type: "major seventh",
        aliases: ["maj7", "Δ", "ma7", "M7", "Maj7", "^7"],
        chroma: "100010010001",
        intervals: ["1P", "3M", "5P", "7M"],
        normalized: "100010010001",
        notes: ["G4", "B4", "D5", "F#5"],
        quality: "Major",
      });
    });
    test("first inversion", () => {
      expect(Chord.getChord("maj7", "G4", "B4")).toEqual({
        empty: false,
        name: "G major seventh over B",
        symbol: "Gmaj7/B",
        tonic: "G4",
        root: "B4",
        rootDegree: 2,
        setNum: 2193,
        type: "major seventh",
        aliases: ["maj7", "Δ", "ma7", "M7", "Maj7", "^7"],
        chroma: "100010010001",
        intervals: ["3M", "5P", "7M", "8P"],
        normalized: "100010010001",
        notes: ["B4", "D5", "F#5", "G5"],
        quality: "Major",
      });
    });
    test("first inversion without octave", () => {
      expect(Chord.getChord("maj7", "G", "B")).toEqual({
        empty: false,
        name: "G major seventh over B",
        symbol: "Gmaj7/B",
        tonic: "G",
        root: "B",
        rootDegree: 2,
        setNum: 2193,
        type: "major seventh",
        aliases: ["maj7", "Δ", "ma7", "M7", "Maj7", "^7"],
        chroma: "100010010001",
        intervals: ["3M", "5P", "7M", "8P"],
        normalized: "100010010001",
        notes: ["B", "D", "F#", "G"],
        quality: "Major",
      });
    });
    test("second inversion", () => {
      expect(Chord.getChord("maj7", "G4", "D5")).toEqual({
        empty: false,
        name: "G major seventh over D",
        symbol: "Gmaj7/D",
        tonic: "G4",
        root: "D5",
        rootDegree: 3,
        setNum: 2193,
        type: "major seventh",
        aliases: ["maj7", "Δ", "ma7", "M7", "Maj7", "^7"],
        chroma: "100010010001",
        intervals: ["5P", "7M", "8P", "10M"],
        normalized: "100010010001",
        notes: ["D5", "F#5", "G5", "B5"],
        quality: "Major",
      });
    });
    test("without root", () => {
      expect(Chord.getChord("M7", "G")).toMatchObject({
        symbol: "GM7",
        name: "G major seventh",
        notes: ["G", "B", "D", "F#"],
      });
    });
    test("rootDegrees", () => {
      expect(Chord.getChord("maj7", "C", "C").rootDegree).toBe(1);
      expect(Chord.getChord("maj", "A2", "Db2").rootDegree).toBe(2);
      expect(Chord.getChord("maj7", "C", "D").empty).toBe(true);
    });
    test("without tonic nor root", () => {
      expect(Chord.getChord("dim")).toEqual({
        symbol: "dim",
        name: "diminished",
        tonic: "",
        root: "",
        rootDegree: 0,
        type: "diminished",
        aliases: ["dim", "°", "o"],
        chroma: "100100100000",
        empty: false,
        intervals: ["1P", "3m", "5d"],
        normalized: "100000100100",
        notes: [],
        quality: "Diminished",
        setNum: 2336,
      });
    });
  });

  test("chord", () => {
    expect(Chord.get("Cmaj7")).toEqual({
      empty: false,
      symbol: "Cmaj7",
      name: "C major seventh",
      tonic: "C",
      root: "",
      rootDegree: 0,
      setNum: 2193,
      type: "major seventh",
      aliases: ["maj7", "Δ", "ma7", "M7", "Maj7", "^7"],
      chroma: "100010010001",
      intervals: ["1P", "3M", "5P", "7M"],
      normalized: "100010010001",
      notes: ["C", "E", "G", "B"],
      quality: "Major",
    });
    expect(Chord.get("hello").empty).toBe(true);
    expect(Chord.get("").empty).toBe(true);
    expect(Chord.get("C").name).toEqual("C major");
  });

  test("chord without tonic", () => {
    expect(Chord.get("dim")).toMatchObject({ name: "diminished" });
    expect(Chord.get("dim7")).toMatchObject({ name: "diminished seventh" });
    expect(Chord.get("alt7")).toMatchObject({ name: "altered" });
  });

  test("notes", () => {
    expect(Chord.get("Cmaj7").notes).toEqual(["C", "E", "G", "B"]);
    expect(Chord.get("Eb7add6").notes).toEqual(["Eb", "G", "Bb", "Db", "C"]);
    expect(Chord.get("C4 maj7").notes).toEqual(["C4", "E4", "G4", "B4"]);
    expect(Chord.get("C7").notes).toEqual(["C", "E", "G", "Bb"]);
    expect(Chord.get("Cmaj7#5").notes).toEqual(["C", "E", "G#", "B"]);
    expect(Chord.get("blah").notes).toEqual([]);
  });

  test("notes with two params", () => {
    expect(Chord.get(["C", "maj7"]).notes).toEqual(["C", "E", "G", "B"]);
    // see: https://github.com/danigb/tonal/issues/82
    expect(Chord.get(["C6", "maj7"]).notes).toEqual(["C6", "E6", "G6", "B6"]);
  });

  // see: https://github.com/danigb/tonal/issues/52
  test("augmented chords (issue #52)", () => {
    expect(Chord.get("Caug").notes).toEqual(["C", "E", "G#"]);
    expect(Chord.get(["C", "aug"]).notes).toEqual(["C", "E", "G#"]);
  });

  test("intervals", () => {
    expect(Chord.get("maj7").intervals).toEqual(["1P", "3M", "5P", "7M"]);
    expect(Chord.get("Cmaj7").intervals).toEqual(["1P", "3M", "5P", "7M"]);
    expect(Chord.get("aug").intervals).toEqual(["1P", "3M", "5A"]);
    expect(Chord.get("C13no5").intervals).toEqual([
      "1P",
      "3M",
      "7m",
      "9M",
      "13M",
    ]);
    expect(Chord.get("major").intervals).toEqual(["1P", "3M", "5P"]);
  });

  test("exists", () => {
    expect(Chord.get("maj7").empty).toBe(false);
    expect(Chord.get("Cmaj7").empty).toBe(false);
    expect(Chord.get("mixolydian").empty).toBe(true);
  });

  test("chordScales", () => {
    const names =
      "phrygian dominant,flamenco,spanish heptatonic,half-whole diminished,chromatic";
    expect(Chord.chordScales("C7b9")).toEqual(names.split(","));
  });

  it("transpose chord names", () => {
    expect(Chord.transpose("Eb7b9", "5P")).toEqual("Bb7b9");
    expect(Chord.transpose("7b9", "5P")).toEqual("7b9");
  });

  test("extended", () => {
    const chords =
      "Cmaj#4 Cmaj7#9#11 Cmaj9 CM7add13 Cmaj13 Cmaj9#11 CM13#11 CM7b9";
    expect(Chord.extended("CMaj7").sort()).toEqual($(chords).sort());
  });

  test("reduced", () => {
    expect(Chord.reduced("CMaj7")).toEqual(["C5", "CM"]);
  });

  /*
  test.skip("position", () => {
    expect(Chord.position("g2 c3 e4 b")).toEqual(2);
    expect(Chord.position("b e c g")).toEqual(3);
  });

  test.skip("inversion", () => {
    expect(Chord.inversion(1, "C4 maj7")).toEqual(["E", "G", "B", "C"]);
    expect(Chord.inversion(0, "e g c")).toEqual(["C", "E", "G"]);
    expect(Chord.inversion(1, "e g c")).toEqual(["E", "G", "C"]);
    expect(Chord.inversion(2, "e g c")).toEqual(["G", "C", "E"]);
    expect(Chord.inversion(0)("b g e d c")).toEqual(["C", "E", "G", "B", "D"]);
    expect(Chord.inversion(3, "CMaj7#5")).toEqual(["B", "C", "E", "G#"]);
    expect(Chord.inversion(1, "c d e")).toEqual([]);
  });
  */
});
