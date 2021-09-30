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

export const NUM_STRATEGIES = STRATEGIES.length

/**
 * Gets the strategy at an index\
 * Used to lazyload
 */
export async function getStrategy<I extends number>(index: I): Promise<Strategy> {
   if (index === 0) {
      return (await import('./checkForSolved')).default
   } else if (index === 1) {
      return (await import('./updateCandidates')).default
   } else if (index === 2) {
      return (await import('./hiddenSingles')).default
   } else if (index === 3) {
      return (await import('./intersectionRemoval')).default
   } else if (index === 4) {
      return (await import('./pairsTriplesAndQuads')).default
   } else if (index === 5) {
      return (await import('./hiddenPairsTriplesAndQuads')).default
   } else if (index === 6) {
      return (await import('./xWing')).default
   } else if (index === 7) {
      return (await import('./swordfish')).default
   } else if (index === 8) {
      return (await import('./jellyfish')).default
   } else if (index === 9) {
      return (await import('./skyscraper')).default
   } else if (index === 10) {
      return (await import('./yWing')).default
   } else if (index === 11) {
      return (await import('./twoMinusOneLines')).default
   } else if (index === 12) {
      return (await import('./xyLoop')).default
   } else if (index === 13) {
      return (await import('./xyChain')).default
   }

   throw new RangeError(`Strategy index { ${index} } is invalid`)
}
