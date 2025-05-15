import deprecate from './deprecate';

test('deprecate', () => {
   const mockFn = jest.fn()
   console.warn = mockFn

   let calls = 0
   function exampleFunction() {
      return calls++
   }

   const deprecatedExampleFunction = deprecate(exampleFunction)
   expect(deprecatedExampleFunction.name).toBe(exampleFunction.name) // Function names are the same

   expect(deprecatedExampleFunction()).toBe(0) // Function still returns same value
   expect(mockFn).toHaveBeenCalledTimes(1) // console.warn is called

   expect(deprecatedExampleFunction()).toBe(1)
   expect(mockFn).toHaveBeenCalledTimes(1) // console.warn is only called for the first usage

   expect(calls).toBe(2)
})
