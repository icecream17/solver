
import { Strategy } from "../Types";
import checkForSolved from "./checkForSolved";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import hiddenSingles from "./hiddenSingles";
import intersectionRemoval from "./intersectionRemoval";
import jellyfish from "./jellyfish";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import skyscraper from "./skyscraper";
import swordfish from "./swordfish";
import twoMinusOneLines from "./twoMinusOneLines";
import updateCandidates from "./updateCandidates";
import xWing from "./xWing";
import yWing from "./yWing";

// See comments on `Strategy`
const STRATEGIES = [
   checkForSolved,
   updateCandidates,
   hiddenSingles,
   intersectionRemoval,
   pairsTriplesAndQuads,
   hiddenPairsTriplesAndQuads,
   xWing,
   swordfish,
   jellyfish,
   skyscraper,
   yWing,
   twoMinusOneLines,
] as const

export default STRATEGIES as typeof STRATEGIES & Strategy[]
