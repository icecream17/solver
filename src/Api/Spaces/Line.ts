import { IndexToNine } from "../../Types";
import Region from "./Region";

/**
 * Maybe there's anothe class called SudokuLine in the future
 */
export class RegionLine extends Array<boolean> {
   constructor (public region: Region, public type: "row" | "column", public index: IndexToNine) {
      super()
      if (type === "row") {
         this.push(...region[index])
      } else {
         this.push(...region.column(index))
      }
   }

   true() {
      const trueIndices = []
      for (let i = 0; i < this.length; i++) {
         if (this[i]) {
            trueIndices.push(i)
         }
      }
      return trueIndices as IndexToNine[]
   }
}
