
import { Strategy } from "../Types";
import checkForSolved from "./checkForSolved";
import hiddenPairsTriplesAndQuads from "./hiddenPairsTriplesAndQuads";
import hiddenSingles from "./hiddenSingles";
import intersectionRemoval from "./intersectionRemoval";
import jellyfish from "./jellyfish";
import pairCoversGroup from "./pairCoversGroup";
import pairsTriplesAndQuads from "./pairsTriplesAndQuads";
import skyscraper from "./skyscraper";
import swordfish from "./swordfish";
import twoMinusOneLines from "./twoMinusOneLines";
import twoStringKite from "./twoStringKite";
import updateCandidates from "./updateCandidates";
import wWing from "./wWing";
import xWing from "./xWing";
import xyChain from "./xyChain";
import xyLoop from "./xyLoop";
import xyzWing from "./xyzWing";
import yWing from "./yWing";

/**
 * If testing a particular strategy, import that strategy instead of this array.
 * This array is meant to be general not specific.
 */
export default [
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
   twoStringKite,
   yWing,
   twoMinusOneLines,
   wWing,
   xyzWing,
   pairCoversGroup,
   xyLoop,
   xyChain,
] as Readonly<Strategy[]>
