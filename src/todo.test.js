import Todo from "./todo";

test('Todo can construct', () => {
   expect(() => new Todo()).not.toThrow()
})

test('Param works', () => {
   expect(() => new Todo("something")).not.toThrow()
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
