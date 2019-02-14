import { names, name, props, degree, decimal } from "..";

const lowercase = xs => xs.map(x => x.toLowerCase());

describe("tonal-roman-numeral", () => {
  it("has names", () => {
    expect(names()).toEqual(["I", "II", "III", "IV", "V", "VI", "VII"]);
    expect(names(false)).toEqual(["i", "ii", "iii", "iv", "v", "vi", "vii"]);
  });
  it("get roman numeral name", () => {
    expect(name("IIIMaj7")).toEqual("III");
    expect(names().map(name)).toEqual(names());
    expect(lowercase(names()).map(name)).toEqual(lowercase(names()));
    expect(name("nothing")).toEqual(null);
    expect(name("iI")).toEqual(null);
  });

  it("get numbers", () => {
    expect(names().map(decimal)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("get props", () => {
    expect(props("VIIb5")).toEqual({
      name: "VII",
      type: "b5",
      decimal: 7,
      major: true
    });
  });

  it("create degrees", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(degree)).toEqual(names());
    expect([1, 2, 3, 4, 5, 6, 7].map(d => degree(d, false))).toEqual(
      names(false)
    );
  });
});
