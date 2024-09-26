import { shapingData, nonSpacingData } from "./data";

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Public functions

/**
 * Returns true if the specific character is an Arabic character.
 *
 * @param char the character to be tested.
 * @returns {boolean}
 */
function isArabicChar(char: string) {
  if (char === undefined || char === null || char === "") {
    return false;
  }

  const codePoint = char.codePointAt(0) as number;

  return (
    (codePoint >= 0x0600 && codePoint <= 0x06ff) ||
    (codePoint >= 0x0750 && codePoint <= 0x077f) ||
    (codePoint >= 0x08a0 && codePoint <= 0x08ff) ||
    (codePoint >= 0xfb50 && codePoint <= 0xfdff) ||
    (codePoint >= 0xfe70 && codePoint <= 0xfeff) ||
    (codePoint >= 0x10e60 && codePoint <= 0x10e7f) ||
    (codePoint >= 0x1ec70 && codePoint <= 0x1ecbf) ||
    (codePoint >= 0x1ee00 && codePoint <= 0x1eeff)
  );
}

/**
 * Returns true if the specified character is an Arabic non-diacritic character.
 *
 * @param char the character to be tested.
 * @returns {boolean}
 */
function isArabicNonDiacritic(char: string) {
  return isArabicChar(char) && !arabicDiacritics.has(charToCodePointStr(char));
}

/**
 * Returns true if the specified character is an Arabic diacritic.
 *
 * @param char the character to be tested.
 * @returns {boolean}
 */
function isArabicDiacritic(char: string) {
  return isArabicChar(char) && arabicDiacritics.has(charToCodePointStr(char));
}

/**
 * Given a character group C (i.e. a letter, possibly followed by one or more
 * diacritics), as well as the previous character group and the following
 * one, returns C with any necessary ZWJ added. If charGroup does not contain an
 * Arabic letter, it is returned unchanged. If charGroup already contains ZWJ,
 * the existing ZWJ is removed and recalculated.
 *
 * @param charGroup the character group that may need zero-width joining characters.
 * @param previousCharGroup the previous character group, or null if this is the beginning
 *        of the text.
 * @param nextCharGroup the next character group, or null if this is this is the end of the
 *        text.
 * @returns {string}
 */
function addZwj(
  charGroup: string,
  previousCharGroup: string,
  nextCharGroup: string
) {
  if (charGroup === undefined || charGroup === null || charGroup === "") {
    return charGroup;
  }

  const charGroupWithoutZwj = removeZwj(charGroup);
  const char = removeDiacritics(charGroupWithoutZwj);

  const previousChar = removeDiacritics(removeZwj(previousCharGroup));
  const nextChar = removeDiacritics(removeZwj(nextCharGroup));

  const zwjInstruction = getZwjInstruction(char, previousChar, nextChar);

  switch (zwjInstruction) {
    case ZwjInstructions.ZwjBefore:
      return ZWJ + charGroupWithoutZwj;

    case ZwjInstructions.ZwjAfter:
      return charGroupWithoutZwj + ZWJ;

    case ZwjInstructions.ZwjBoth:
      return ZWJ + charGroupWithoutZwj + ZWJ;

    default:
      return charGroupWithoutZwj;
  }
}

/**
 * Removes all ZWJ from a string.
 *
 * @param str a string that may contain ZWJ.
 * @returns {string}
 */
function removeZwj(str: string) {
  if (str === undefined || str === null || str === "") {
    return str;
  }

  let result = "";
  let pos = 0;

  while (pos < str.length) {
    const char = String.fromCodePoint(str.codePointAt(pos) as number);

    if (char !== ZWJ) {
      result += char;
    }

    pos += char.length;
  }

  return result;
}

/**
 * Returns the next character group starting at the
 * specified position in a string. Each Arabic letter and its diacritics
 * become a group. Any other character becomes a group by itself.
 *
 * @param str the string.
 * @param startPos the position of the first character in
 *        the character group.
 * @returns {string}
 */
function getNextCharGroup(str: string, startPos: number) {
  let charGroup = "";
  let pos = startPos;

  while (pos < str.length) {
    const char = String.fromCodePoint(str.codePointAt(pos) as number);

    if (charGroup === "") {
      charGroup = char;
      pos += char.length;
    } else if (isArabicDiacritic(char)) {
      charGroup += char;
      pos += char.length;
    } else {
      break;
    }
  }

  return charGroup;
}

/**
 * Splits a string into an array of character groups and adds ZWJ
 * to each group as needed. Each Arabic letter and its diacritics
 * become a group. Any other character becomes a group by itself.
 *
 * @param str the string to be transformed.
 */
function makeCharGroupsWithZwj(str: string) {
  const charGroups: string[] = [];
  let pos = 0;

  while (pos < str.length) {
    const charGroup = getNextCharGroup(str, pos);
    charGroups.push(charGroup);
    pos += charGroup.length;
  }

  return charGroups.map((charGroup, index) => {
    let previousCharGroup = null;
    let nextCharGroup = null;

    if (index > 0) {
      previousCharGroup = charGroups[index - 1];
    }

    if (index < charGroups.length - 1) {
      nextCharGroup = charGroups[index + 1];
    }

    return addZwj(
      charGroup,
      previousCharGroup as string,
      nextCharGroup as string
    );
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Private functions

const ZWJ = "\u200D";

function removeDiacritic(str: string, pos: number) {
  if (
    str === undefined ||
    str === null ||
    str === "" ||
    pos === undefined ||
    pos === null ||
    pos < 0
  ) {
    return str;
  }

  const strCodePoints = [...str].map(
    (c, cIdx) => str.codePointAt(cIdx) as number
  );
  strCodePoints.splice(pos + 1, 1);

  return String.fromCodePoint(...strCodePoints);
}

function removeDiacritics(str: string) {
  if (str === undefined || str === null || str === "") {
    return str;
  }

  let result = "";
  let pos = 0;

  while (pos < str.length) {
    const char = String.fromCodePoint(str.codePointAt(pos) as number);

    if (!isArabicDiacritic(char)) {
      result += char;
    }

    pos += char.length;
  }

  return result;
}

function addDiacritic(str: string, pos: number, diacritic: number) {
  if (
    str === undefined ||
    str === null ||
    str === "" ||
    !arabicDiacritics.has(diacritic.toString(16).toUpperCase())
  ) {
    return str;
  }

  const strCodePoints = [...str].map(
    (c, cIdx) => str.codePointAt(cIdx) as number
  );
  strCodePoints.splice(pos + 1, 0, diacritic);

  return String.fromCodePoint(...strCodePoints);
}

const ZwjInstructions = {
  ZwjBefore: "Zwj_Before",
  ZwjAfter: "Zwj_After",
  ZwjBoth: "Zwj_Both",
  ZwjNone: "Zwj_None",
};

Object.freeze(ZwjInstructions);

function getZwjInstruction(
  char: string,
  previousChar: string,
  nextChar: string
) {
  const charJoiningProperty = getJoiningProperty(char);
  const previousCharJoiningProperty = getJoiningProperty(previousChar);
  const nextCharJoiningProperty = getJoiningProperty(nextChar);

  const needsZwJBefore =
    joinsLeft(previousCharJoiningProperty) && joinsRight(charJoiningProperty);
  const needsZwJAfter =
    joinsLeft(charJoiningProperty) && joinsRight(nextCharJoiningProperty);

  if (needsZwJBefore && needsZwJAfter) {
    return ZwjInstructions.ZwjBoth;
  } else if (needsZwJBefore) {
    return ZwjInstructions.ZwjBefore;
  } else if (needsZwJAfter) {
    return ZwjInstructions.ZwjAfter;
  } else {
    return ZwjInstructions.ZwjNone;
  }
}

function charToCodePointStr(char: string) {
  return (char.codePointAt(0) as number).toString(16).toUpperCase();
}

const JoiningProperties = {
  RightJoining: "R",
  LeftJoining: "L",
  DualJoining: "D",
  JoinCausing: "C",
  NonJoining: "U",
  Transparent: "T",
};

Object.freeze(JoiningProperties);

function getJoiningProperty(char: string) {
  if (!isArabicChar(char)) {
    return JoiningProperties.NonJoining;
  } else {
    const codePointStr = charToCodePointStr(char);

    if (arabicDiacritics.has(codePointStr)) {
      return JoiningProperties.Transparent;
    } else {
      const char_shaping_data = (shapingData as any)[codePointStr];

      if (char_shaping_data === undefined) {
        return JoiningProperties.NonJoining;
      } else {
        return char_shaping_data;
      }
    }
  }
}

function joinsLeft(joiningProperty: string) {
  return (
    joiningProperty === JoiningProperties.LeftJoining ||
    joiningProperty === JoiningProperties.DualJoining
  );
}

function joinsRight(joiningProperty: string) {
  return (
    joiningProperty === JoiningProperties.RightJoining ||
    joiningProperty === JoiningProperties.DualJoining
  );
}

// A set of all Arabic non-spacing marks.
const arabicDiacritics = new Set(nonSpacingData["diacritics"]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Construct module object

export {
  isArabicChar,
  isArabicNonDiacritic,
  isArabicDiacritic,
  addZwj,
  removeZwj,
  addDiacritic,
  removeDiacritic,
  removeDiacritics,
  getNextCharGroup,
  makeCharGroupsWithZwj,
};
