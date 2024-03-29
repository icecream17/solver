import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import asyncPrompt from "./asyncPrompt";
import { forComponentsToUpdate } from "./utils";

export async function importBoard(text: string) {
   userEvent.click(screen.getByRole("button", { name: "import" }))
   userEvent.type(await screen.findByRole("textbox", { name: "Enter digits or candidates" }), text)
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

export function switchTab (name: string) {
   userEvent.click(screen.getByRole("tab", { name }))
}

export function customAlert (...args: Parameters<typeof window._custom.alert>) {
   act(() => window._custom.alert(...args))
}

// export function customPrompt (...args: Parameters<typeof window._custom.prompt>) {
//    act(() => window._custom.prompt(...args))
// }

export async function customAsyncPrompt (...args: Parameters<typeof asyncPrompt>) {
   return await new Promise<ReturnType<typeof asyncPrompt>>(resolve => {
      act(() => resolve(asyncPrompt(...args)))
   })
}
