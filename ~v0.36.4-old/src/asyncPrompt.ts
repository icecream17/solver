import { PromptCallback } from "./Types"

export default function asyncPrompt(title: string, message: string, defaultResult?: string, cssCls?: string): Promise<string | null> {
   return new Promise(resolve => {
      window._custom.prompt(title, message, defaultResult, resolve as PromptCallback, cssCls)
   })
}
