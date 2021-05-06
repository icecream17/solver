import Todo from "./todo";

test('Todo can construct', () => {
   expect(new Todo()).toBeInstanceOf(Todo)
})

test('Default param is null', () => {
   expect((new Todo()).description).toBeNull()
})

test('Param works', () => {
   expect((new Todo("something")).description).toBe("something")
})

test('toString', () => {
   expect(String(new Todo())).toBe('[Todo: null]')
   expect(String(new Todo("something"))).toBe("[Todo: something]")
})

describe('Todo.func', () => {
   test('it exists', () => {
      expect(Todo.func).not.toBeUndefined()
   })

   test('it can be called', () => {
      expect(new Todo.func()).toBeInstanceOf(Function)
   })

   test('Default param is null', () => {
      expect((new Todo.func()).description).toBeNull()
   })

   test('Param works', () => {
      expect((new Todo.func("something")).description).toBe("something")
   })

   test('toString', () => {
      expect(String(new Todo.func())).toBe('[Todo.func: null]')
      expect(String(new Todo.func("something"))).toBe("[Todo.func: something]")
   })

   test.skip('calls console.info', () => {
      expect(Function.prototype.toString.call(new Todo.func()))
         .toContain('console.info')
   })
})
