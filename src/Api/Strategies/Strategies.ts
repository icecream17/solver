
import { Strategy } from "../Types";
import checkForSolved from "./checkForSolved";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import hiddenSingles from "./hiddenSingles";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import updateCandidates from "./updateCandidates";

// See comments on `Strategy`
const STRATEGIES = [
   checkForSolved,
   updateCandidates,
   hiddenSingles,
   pairsTriplesAndQuads,
   hiddenPairsTriplesAndQuads
] as const

export default STRATEGIES as typeof STRATEGIES & Strategy[]
