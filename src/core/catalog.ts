import strategies from './strategies/Strategies'

const entries = [
   ['Check for solved', ''],
   ['Update candidates', ''],
   ['Hidden singles', 'https://www.sudokuwiki.org/Getting_Started'],
   ['Intersection removal', 'https://www.sudokuwiki.org/Intersection_Removal'],
   ['Pairs, triples, and quads', 'https://www.sudokuwiki.org/Naked_Candidates'],
   ['Hidden pairs, triples, and quads', 'https://www.sudokuwiki.org/Hidden_Candidates'],
   ['X wing', 'https://www.sudokuwiki.org/X_Wing_Strategy'],
   ['Swordfish', 'https://www.sudokuwiki.org/Sword_Fish_Strategy'],
   ['Jellyfish', 'https://www.sudokuwiki.org/Jelly_Fish_Strategy'],
   ['Skyscraper', 'https://www.sudopedia.org/wiki/Skyscraper'],
   ['Two string kite', 'https://www.sudopedia.org/wiki/2-String_Kite'],
   ['Y wing (aka Bent triple)', 'https://www.sudokuwiki.org/Y_Wing_Strategy'],
   ['Two minus one lines', 'https://github.com/icecream17/solver/blob/main/Strategies.md#two-minus-one-lines'],
   // Historical learning link only; ExternalLink suppresses referrer data.
   // eslint-disable-next-line sonarjs/no-clear-text-protocols
   ['W wing', 'http://sudopedia.enjoysudoku.com/W-Wing.html'],
   ['XYZ wing', 'https://hodoku.sourceforge.net/en/tech_wings.php#xyz'],
   ['Pair covers group', 'https://github.com/icecream17/solver/wiki/Pair-covers-group/'],
   ['XY Ring (Loop)', 'https://youtu.be/OUKwjVs4MsY'],
   ['XY Chain', 'https://www.sudokuwiki.org/XY_Chains'],
] as const

export const catalog = entries.map(([name, href], index) => ({
   name, href, required: index === 0, run: strategies[index],
}))
