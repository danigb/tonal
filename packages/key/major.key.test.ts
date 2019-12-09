import { majorKey, majorTonicFromKeySignature } from "./index";

describe("@tonal/key", () => {
  test("fromAlter", () => {
    expect(majorTonicFromKeySignature("###")).toEqual("A");
    expect(majorTonicFromKeySignature(3)).toEqual("A");
    expect(majorTonicFromKeySignature("b")).toEqual("F");
    expect(majorTonicFromKeySignature("bb")).toEqual("Bb");
    expect(majorTonicFromKeySignature("other")).toEqual(null);
  });
  test("keySignature", () => {
    const tonics = "C D E F G A B".split(" ");
    expect(tonics.map(tonic => majorKey(tonic).keySignature).join(" ")).toEqual(
      " ## #### b # ### #####"
    );
  });
  test("majorKey", () => {
    expect(majorKey("C")).toMatchInlineSnapshot(`
      Object {
        "alteration": 0,
        "chords": Array [
          "Cmaj7",
          "Dm7",
          "Em7",
          "Fmaj7",
          "G7",
          "Am7",
          "Bm7b5",
        ],
        "chordsHarmonicFunction": Array [
          "T",
          "SD",
          "T",
          "SD",
          "D",
          "T",
          "D",
        ],
        "grades": Array [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
        ],
        "intervals": Array [
          "1P",
          "2M",
          "3M",
          "4P",
          "5P",
          "6M",
          "7M",
        ],
        "keySignature": "",
        "minorRelative": "A",
        "scale": Array [
          "C",
          "D",
          "E",
          "F",
          "G",
          "A",
          "B",
        ],
        "secondaryDominants": Array [
          "",
          "DVI7",
          "EVII7",
          "FI7",
          "GII7",
          "AIII7",
          "",
        ],
        "secondaryDominantsMinorRelative": Array [
          "",
          "DIIIm7b5",
          "EIV#m7",
          "FVm7",
          "GVIm7",
          "AVIIm7b5",
          "",
        ],
        "substituteDominants": Array [
          "",
          "DbIII7",
          "EIV7",
          "FbV7",
          "GbVI7",
          "AbVII7",
          "",
        ],
        "substituteDominantsMinorRelative": Array [
          "",
          "DIIIm7",
          "EIm7",
          "FIIbm7",
          "GVIm7",
          "AIVm7",
          "",
        ],
        "tonic": "C",
        "type": "major",
      }
    `);
  });
});
