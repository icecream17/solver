
import { Strategy } from "../Types";
import checkForSolved from "./checkForSolved";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import hiddenSingles from "./hiddenSingles";
import intersectionRemoval from "./intersectionRemoval";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import updateCandidates from "./updateCandidates";
import xWing from "./xWing";

// See comments on `Strategy`
const STRATEGIES = [
   checkForSolved,
   updateCandidates,
   hiddenSingles,
   pairsTriplesAndQuads,
   hiddenPairsTriplesAndQuads,
   intersectionRemoval,
   xWing,
] as const

export default STRATEGIES as typeof STRATEGIES & Strategy[]
