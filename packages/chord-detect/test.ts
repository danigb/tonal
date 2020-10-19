import { detect } from "./index";

describe("@tonal/chord-detect", () => {
  test("detect", () => {
    expect(detect(["D", "F#", "A", "C"])).toEqual(["D7/C"]);
    expect(detect(["D3", "F#4", "A3", "C4"])).toEqual(["D7"]);
    expect(detect(["F#4", "A3", "C4", "D3"])).toEqual(["D7"]);
    expect(detect(["F#2", "A3", "C4", "D3"])).toEqual(["D7/F#"]);
    expect(detect(["A3", "C4", "D3", "F#4"])).toEqual(["D7"]);
    expect(detect(["A2", "C4", "D3", "F#4"])).toEqual(["D7/A"]);
    expect(detect(["E3", "G#4", "B4", "C#4"])).toEqual(["E6", "C#m7/E"]);
    expect(detect(["C4", "E4", "G4"])).toEqual(["CM", "Em#5/C"]);
    expect(detect(["E4", "G4", "C5"])).toEqual(["Gm#5", "CM/E"]);
  });

  test("(regression) detect aug", () => {
    expect(detect(["C", "E", "G#"])).toEqual(["Caug", "Eaug/C", "G#aug/C"]);
    expect(detect(["E", "G#", "C"])).toEqual(["Caug", "Eaug/C", "G#aug/C"]);
  });

  test("edge cases", () => {
    expect(detect([])).toEqual([]);
  });
});
