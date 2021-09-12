import { CandidateID } from "../Utils";
import Link from "./Link";

export default class LinkRegistry extends Map<CandidateID, Set<Link>> {
   add (link: Link) {
      this.addToCandidate(link.candA, link)
      this.addToCandidate(link.candB, link)
   }

   addToCandidate (candidate: CandidateID, link: Link) {
      if (this.has(candidate)) {
         (this.get(candidate) as Set<Link>).add(link)
      } else {
         this.set(candidate, new Set([link]))
      }
   }
}
