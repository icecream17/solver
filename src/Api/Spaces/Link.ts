// @flow

import { CandidateID } from "../Utils";

export type StrengthFlag = "strong" | "weak"

export type RelationFlag = "negative" | "positive"

export default class Link {
   constructor (
      public readonly candA: CandidateID,
      public readonly candB: CandidateID,
      public readonly flags: [StrengthFlag, RelationFlag] = ["strong", "negative"]
   ) {}

   other(candidate: CandidateID) {
      if (candidate === this.candA) {
         return this.candB
      } else if (candidate === this.candB) {
         return this.candA
      }
      throw new ReferenceError("Candidate is not part of this link")
   }
}
