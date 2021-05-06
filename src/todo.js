
class Todo {
   constructor (description=null) {
      this.description = description;
   }

   toString() {
      return `[Todo: ${this.description}]`
   }

   static func = class func extends Todo {
      constructor(description = null) {
         const todofunc = (
            function logtodo(string) {
               console.info(string)
            }
         ).bind(null, [Todo.func.prototype.toString.call({ description })])

         return Object.assign(todofunc,
            {
               description,
               toString() {
                  return `[Todo.func: ${this.description}]`
               }
            }
         )
      }
   }
}

export default Todo
