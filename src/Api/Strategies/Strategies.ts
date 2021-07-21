
import { Strategy } from "../Types";
import checkForSolved from "./checkForSolved";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import hiddenSingles from "./hiddenSingles";
import intersectionRemoval from "./intersectionRemoval";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import updateCandidates from "./updateCandidates";

// See comments on `Strategy`
const STRATEGIES = [
   checkForSolved,
   updateCandidates,
   hiddenSingles,
   pairsTriplesAndQuads,
   hiddenPairsTriplesAndQuads,
   intersectionRemoval,
] as const

export default STRATEGIES as typeof STRATEGIES & Strategy[]
