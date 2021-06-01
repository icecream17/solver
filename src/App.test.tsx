import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import asyncPrompt from './asyncPrompt';
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
   expect(screen.getByRole('group', { name: 'strategies' })).toBeInTheDocument()
   expect(screen.getByRole('group', { name: 'controls' })).toBeInTheDocument()
})

// Silly test
test("Click everything", () => {
   for (const element of document.querySelectorAll("*")) {
      userEvent.click(element)
   }
})

test("The alert system", () => {
   const testText = "42 tnhbtxlvp320ajq6lcpy" // random string
   window._custom.alert(testText)
   expect(screen.getByText(testText)).toBeInTheDocument()

   const closeButton = screen.getByRole('button', { name: 'Ok' })
   expect(closeButton).toBeInTheDocument()
   userEvent.click(closeButton)
   expect(closeButton).not.toBeInTheDocument()
})

test("The prompt system", () => {
   const testText = "42 tnhbtxlvp320ajq6lcpy" // random string

   // Cancel
   const promptPromise = asyncPrompt(testText)
   expect(screen.getByText(testText)).toBeInTheDocument()
   const closeButton = screen.getByRole('button', { name: 'Cancel' })
   expect(closeButton).toBeInTheDocument()
   userEvent.click(closeButton)
   expect(closeButton).not.toBeInTheDocument()
   expect(promptPromise).resolves.toBeNull()

   // Submit
   const promptPromise2 = asyncPrompt(testText)
   const inputElement = screen.getByRole('textbox', { name: testText })
   const submitButton = screen.getByRole('button', { name: 'Submit' })
   userEvent.type(inputElement, testText)
   userEvent.click(submitButton)
   expect(promptPromise2).resolves.toBe(testText)
})

test.todo("Strategy control testing")
