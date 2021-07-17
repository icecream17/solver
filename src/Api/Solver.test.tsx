
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { forComponentsToUpdate } from "../utils";
import BOARDS from "./boards";

beforeEach(() => {
   render(<App />);
})

export async function importBoard(text: string) {
   userEvent.click(screen.getByRole("button", { name: "import" }))
   await forComponentsToUpdate()
   userEvent.type(screen.getByRole("textbox", { name: "Enter data (todo: clarify)" }), text)
   userEvent.click(screen.getByRole("button", { name: "Submit" }))
   await forComponentsToUpdate()
}

export function visuallyCurrentStrategy() {
   return document.getElementsByClassName("isCurrent")[0] as HTMLElement | undefined
}

export function currentStrategyIndex() {
   const currentStrategy = visuallyCurrentStrategy()
   if (currentStrategy === undefined) {
      return -2
   }

   const parentChildren = currentStrategy.parentElement?.children
   if (parentChildren === undefined) {
      throw TypeError("Current strategy does not have a parent???")
   }
   return Array.prototype.indexOf.call(parentChildren, currentStrategy)
}

test("No visuallyCurrentStrategy by default", () => {
   expect(visuallyCurrentStrategy()).toBeUndefined()
})

test.skip("Stays at first strategy when board is invalid", async () => {
   await importBoard(BOARDS["Invalid board"])
   userEvent.click(screen.getByRole("button", { name: "step" }))
   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))
})

test.skip("Strategy index starts at 0", async () => {
   await importBoard(BOARDS["Simple sudoku"])
   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))
})

test.skip("Strategy index goes to 1 next", async () => {
   await importBoard(BOARDS["Simple sudoku"])
   userEvent.click(screen.getByRole("button", { name: "step" }))
   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(1))
})

test.skip("After a strategy success, the index is 0 again", async () => {
   await importBoard(BOARDS["Simple sudoku"])
   userEvent.click(screen.getByRole("button", { name: "step" }))
   userEvent.click(screen.getByRole("button", { name: "step" }))
   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))
})
