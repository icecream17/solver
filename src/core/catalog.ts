import type { Strategy } from './strategy-types'
import checkForSolved from './strategies/checkForSolved'
import hiddenPairsTriplesAndQuads from './strategies/hiddenPairsTriplesAndQuads'
import hiddenSingles from './strategies/hiddenSingles'
import intersectionRemoval from './strategies/intersectionRemoval'
import jellyfish from './strategies/jellyfish'
import pairCoversGroup from './strategies/pairCoversGroup'
import pairsTriplesAndQuads from './strategies/pairsTriplesAndQuads'
import skyscraper from './strategies/skyscraper'
import swordfish from './strategies/swordfish'
import twoMinusOneLines from './strategies/twoMinusOneLines'
import twoStringKite from './strategies/twoStringKite'
import updateCandidates from './strategies/updateCandidates'
import wWing from './strategies/wWing'
import xWing from './strategies/xWing'
import xyChain from './strategies/xyChain'
import xyLoop from './strategies/xyLoop'
import xyzWing from './strategies/xyzWing'
import yWing from './strategies/yWing'

// Keep each strategy beside its label and reference; order defines session indices.
const entries: readonly [string, string, Strategy][] = [
   ['Check for solved', '', checkForSolved],
   ['Update candidates', '', updateCandidates],
   ['Hidden singles', 'https://www.sudokuwiki.org/Getting_Started', hiddenSingles],
   ['Intersection removal', 'https://www.sudokuwiki.org/Intersection_Removal', intersectionRemoval],
   [
      'Pairs, triples, and quads',
      'https://www.sudokuwiki.org/Naked_Candidates',
      pairsTriplesAndQuads
   ],
   [
      'Hidden pairs, triples, and quads',
      'https://www.sudokuwiki.org/Hidden_Candidates',
      hiddenPairsTriplesAndQuads
   ],
   ['X wing', 'https://www.sudokuwiki.org/X_Wing_Strategy', xWing],
   ['Swordfish', 'https://www.sudokuwiki.org/Sword_Fish_Strategy', swordfish],
   ['Jellyfish', 'https://www.sudokuwiki.org/Jelly_Fish_Strategy', jellyfish],
   ['Skyscraper', 'https://www.sudopedia.org/wiki/Skyscraper', skyscraper],
   ['Two string kite', 'https://www.sudopedia.org/wiki/2-String_Kite', twoStringKite],
   ['Y wing (aka Bent triple)', 'https://www.sudokuwiki.org/Y_Wing_Strategy', yWing],
   [
      'Two minus one lines',
      'https://github.com/icecream17/solver/blob/main/Strategies.md#two-minus-one-lines',
      twoMinusOneLines
   ],
   // Historical learning link only; ExternalLink suppresses referrer data.
   // eslint-disable-next-line sonarjs/no-clear-text-protocols
   ['W wing', 'http://sudopedia.enjoysudoku.com/W-Wing.html', wWing],
   ['XYZ wing', 'https://hodoku.sourceforge.net/en/tech_wings.php#xyz', xyzWing],
   [
      'Pair covers group',
      'https://github.com/icecream17/solver/wiki/Pair-covers-group/',
      pairCoversGroup
   ],
   ['XY Ring (Loop)', 'https://youtu.be/OUKwjVs4MsY', xyLoop],
   ['XY Chain', 'https://www.sudokuwiki.org/XY_Chains', xyChain]
]

export const catalog = entries.map(([name, href, run], index) => ({
   name,
   href,
   required: index === 0,
   run
}))
