import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import asyncPrompt from './asyncPrompt';
import { switchTab } from './testUtils';
import { AlertType } from './Types';
import { forComponentsToUpdate } from './utils';

beforeEach(() => {
   render(<App />); // Implicit "it renders" check
})

// Explicit implicit checks //
test('getting the main element', () => {
   expect(screen.getByRole('main')).toBeInTheDocument()
})

test('a header exists', () => {
   expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})

test("Strategy sections exist", () => {
   switchTab('strats')
   expect(screen.getByRole('group', { name: 'strategies' })).toBeInTheDocument()
   expect(screen.getByRole('group', { name: 'controls' })).toBeInTheDocument()
})

test("The alert system", async () => {
   const testText = "42 tnhbtxlvp320ajq6lcpy" // random string
   window._custom.alert(testText)
   expect(await screen.findByText(testText)).toBeInTheDocument()

   const closeButton = screen.getByRole('button', { name: 'Ok' })
   expect(closeButton).toBeInTheDocument()
   userEvent.click(closeButton)
   expect(closeButton).not.toBeInTheDocument()

   // Alert type
   window._custom.alert(testText, AlertType.ERROR)
   const closeButton2 = await screen.findByRole('button', { name: 'Ok' })
   expect(closeButton2.parentElement).toHaveClass(AlertType.ERROR)
   userEvent.click(closeButton2)
})

test("The prompt system", async () => {
   const testText = "42 tnhbtxlvp320ajq6lcpy" // random string

   // Cancel
   const promptPromise = asyncPrompt(testText)
   expect(await screen.findByText(testText)).toBeInTheDocument()
   const closeButton = screen.getByRole('button', { name: 'Cancel' })
   expect(closeButton).toBeInTheDocument()
   userEvent.click(closeButton)
   expect(closeButton).not.toBeInTheDocument()
   expect(promptPromise).resolves.toBeNull()

   // Submit
   const promptPromise2 = asyncPrompt(testText)
   await forComponentsToUpdate()
   const inputElement = screen.getByRole('textbox', { name: testText }) as HTMLInputElement
   const submitButton = screen.getByRole('button', { name: 'Submit' })
   userEvent.type(inputElement, testText) // Make sure the input isn't disabled or readonly or something.
   expect(inputElement.value).toBe(testText)
   userEvent.click(submitButton)
   expect(promptPromise2).resolves.toBe(testText)

   // Submit with default result
   const promptPromise3 = asyncPrompt(testText, testText)
   await forComponentsToUpdate()
   const inputElementAgain = screen.getByRole('textbox', { name: testText }) as HTMLInputElement
   const submitButtonAgain = screen.getByRole('button', { name: 'Submit' })
   expect(inputElementAgain.value).toBe(testText)
   userEvent.click(submitButtonAgain)
   expect(promptPromise3).resolves.toBe(testText)
})

test.todo("Strategy control testing")

// Silly test - it goes at the end because Jest doesn't cleanup correctly
test("Click everything", () => {
   let elementsClicked = 0

   for (const element of document.querySelectorAll("*")) {
      userEvent.click(element)

      elementsClicked++
      if (elementsClicked > 10000) {
         console.debug(element)
         throw ReferenceError("Too many elements clicked")
      }
   }

   console.info(elementsClicked)

   // No errors!
   expect(true).toBe(true)
})
