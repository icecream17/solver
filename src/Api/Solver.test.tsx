
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { getButtonCellElement } from "../Elems/MainElems/Sudoku.testUtils";
import BOARDS from "./boards";
import { importBoard, visuallyCurrentStrategy, currentStrategyIndex, switchTab } from "../testUtils";

jest.setTimeout(17000);

beforeEach(() => {
   render(<App />);
   switchTab("strategies");
})

test("Import board", async () => {
   await importBoard(BOARDS["swordfish wow"])
   await waitFor(() => {
      expect(getButtonCellElement(8, 0)).toHaveTextContent("4")
   })
})


test("No visuallyCurrentStrategy by default", () => {
   expect(visuallyCurrentStrategy()).toBeUndefined()
})

test("Strategy index starts at 0", async () => {
   await importBoard(BOARDS["Simple sudoku"])

   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))
})

// I have to do a "waitFor" after each click event
// For some reason it doesn't update
test("Strategy index goes to 1 next", async () => {
   await importBoard(BOARDS["Simple sudoku"])

   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))

   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(1))
})

test("Stays at first strategy when board is invalid", async () => {
   await importBoard('11' + '.'.repeat(79))
   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(screen.getByRole('status', { name: 'Status for Check for solved' })).toHaveTextContent(/^Error!$/))
   expect(currentStrategyIndex()).toBe(0)
   const message = 'Two (or more) 1s in row A!'
   expect(screen.getByText(message, { selector: '.AlertNotice p' })).toBeInTheDocument()
   expect(screen.getByText(message, { selector: '.StrategyDetails p' })).toBeInTheDocument()
   expect(getButtonCellElement(0, 0)).toHaveTextContent(/^1$/)
   expect(getButtonCellElement(0, 1)).toHaveTextContent(/^1$/)
})

test("After a strategy success, the index is 0 again", async () => {
   await importBoard('1' + '.'.repeat(80))
   expect(getButtonCellElement(0, 1)).toHaveTextContent(/^$/)

   userEvent.click(screen.getByRole("button", { name: "go" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(1))
   expect(getButtonCellElement(0, 1)).toHaveTextContent(/^23456789$/)
   expect(getButtonCellElement(8, 8)).toHaveTextContent(/^$/)

   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))
   expect(getButtonCellElement(0, 1)).toHaveTextContent(/^23456789$/)
})

test("It skips over a disabled strategy", async () => {
   await importBoard('1' + '.'.repeat(80))

   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(0))

   userEvent.click(screen.getByRole("switch", { name: "Toggle Update candidates" })) // See getTogglers in Aside.test.tsx

   userEvent.click(screen.getByRole("button", { name: "step" }))
   await waitFor(() => expect(currentStrategyIndex()).toBe(2)) // 0 indexing
   expect(getButtonCellElement(0, 1)).toHaveTextContent(/^$/)
   expect(screen.getByRole('status', { name: 'Status for Update candidates' })).toHaveTextContent(/^$/)
})

