import { render, screen } from '@testing-library/react';
import App from './App';
import { hasGlobalRef, getGlobalRef } from './globalRef'

render(<App />);

describe('app', () => {
   test('it exists', () => {
      expect(document.getElementsByClassName('App')).toHaveLength(1)
   })

   const appElement = document.getElementsByClassName('App')[0]

   describe('header', () => {
      const appHeader = appElement.children[0]

      test('it exists', () => {
         expect(appHeader).not.toBeUndefined()
      })

      test('is a <header>', () => {
         expect(appHeader.tagName).toBe('HEADER')
      })

      test('has class App-header', () => {
         expect(appHeader).toHaveClass('App-header')
      })

      test('has title and version', () => {
         expect(appHeader.children).toHaveLength(2)
         expect(appHeader.children[0]).toHaveClass('Title')
         expect(appHeader.children[1]).toHaveClass('Version')
      })
   });

   describe('main', () => {
      const mainElement = appElement.children[1]
      test('it exists', () => {
         expect(mainElement).not.toBeUndefined()
      })

      test('has class App-main', () => {
         expect(mainElement).toHaveClass('App-main')
      })
   })

   describe('aside', () => {
      const asideElement = appElement.children[2]
      test('it exists', () => {
         expect(asideElement).not.toBeUndefined()
      })

      test('has class App-aside', () => {
         expect(asideElement).toHaveClass('App-aside')
      })

      test('globalRef matches', () => {
         expect(hasGlobalRef('Aside')).toBe(true)
         expect(getGlobalRef('Aside').current).toBe(asideElement)
      })
   })
})
