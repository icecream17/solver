import { render, screen } from '@testing-library/react';
import App from './App';
import { getGlobalRef } from './globalRef'

render(<App />);

test('app exists', () => {
   expect(document.getElementsByClassName('App')).toHaveLength(1)
})

describe('header', () => {
   const AppHeaders = document.getElementsByClassName('App-header')

   test('it exists', () => {
      expect(AppHeaders).toHaveLength(1)
      expect(AppHeaders[0].tagName).toBe('HEADER')
   })
   
   test('has title and version', () => {
      expect(AppHeaders[0].children).toHaveLength(2)
   })
});

describe('main', () => {
   test('it exists', () => {
      expect(document.getElementsByClassName('App-main')).toHaveLength(1)
   })
})

describe('aside', () => {
   test('it exists', () => {
      expect(document.getElementsByClassName('App-aside')).toHaveLength(1)
   })

   test('globalRef exists', () => {
      expect(getGlobalRef('Aside')).not.toBeUndefined()
   })
})
