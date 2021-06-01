import { PromptCallback } from "./Types"

export default function asyncPrompt(message?: string, defaultResult?: string): Promise<string | null> {
   return new Promise(resolve => {
      window._custom.prompt(message, defaultResult, resolve as PromptCallback)
   })
}
