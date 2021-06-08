
import { Strategy } from "../Types";
import checkForSolved from "./checkForSolved";
import hiddenSingles from "./hiddenSingles";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import updateCandidates from "./updateCandidates";

// See comments on `Strategy`
const STRATEGIES = [
   checkForSolved,
   updateCandidates,
   hiddenSingles,
   pairsTriplesAndQuads,
] as const

export default STRATEGIES as typeof STRATEGIES & Strategy[]
