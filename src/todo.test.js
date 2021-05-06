import Todo from "./todo";

test('Todo can construct', () => {
   expect(() => new Todo()).not.toThrow()
})

test('Param works', () => {
   expect(() => new Todo("something")).not.toThrow()
})

test('toString', () => {
   if (!((new Todo()).hasOwnProperty('toString'))) {
      expect(true).toBe(true)
      console.warn('Remove outdated test')
      return
   }

   expect(String(new Todo())).not.toBe('[object Object]')
   expect(String(new Todo("something"))).not.toBe("[object Object]")
})

describe('Todo.func', () => {
   test('it exists', () => {
      expect(Todo.func).not.toBeUndefined()
   })

   test('it can be called', () => {
      expect(() => (new Todo.func())()).not.toThrow()
   })

   test('Param works', () => {
      expect(() => (new Todo.func("something"))()).not.toThrow()
   })
})
