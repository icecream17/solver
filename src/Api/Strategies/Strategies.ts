import { Strategy } from '../Types'

// See comments on `Strategy`
const STRATEGIES = [
   'checkForSolved',
   'updateCandidates',
   'hiddenSingles',
   'intersectionRemoval',
   'pairsTriplesAndQuads',
   'hiddenPairsTriplesAndQuads',
   'xWing',
   'swordfish',
   'jellyfish',
   'skyscraper',
   'yWing',
   'twoMinusOneLines',
   'xyLoop',
   'xyChain',
]

const strategyCache = [] as Strategy[]

export const NUM_STRATEGIES = STRATEGIES.length

/**
 * Gets the strategy at an index\
 * Used to lazyload
 */
export async function getStrategy<I extends number>(index: I): Promise<Strategy> {
   return strategyCache[index] ??= (
      await import(`./${STRATEGIES[index]}`) as { default: Strategy }
   ).default
}
