import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import * as todoService from "./todoService.js";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });

const deleteTodo = async (c) => {
    const id = c.req.param("id");
    await todoService.deleteTodo(id);
    return c.redirect("/todos");
  };

  const updateTodo = async (c) => {
    const id = c.req.param("id");
    const body = await c.req.parseBody();
    await todoService.updateTodo(id, body);
    return c.redirect(`/todos/${id}`);
  };

  const showForm = async (c) => {
    return c.html(
      eta.render("todos.eta", { todos: await todoService.listTodos() }),
    );
  };

  const createTodo = async (todo) => {
    todo.id = crypto.randomUUID();
  
    const kv = await Deno.openKv();
    await kv.set(["todos", todo.id], todo);
  };
  
  const listTodos = async () => {
    const kv = await Deno.openKv();
    const todoEntries = await kv.list({ prefix: ["todos"] });
  
    const todos = [];
    for await (const entry of todoEntries) {
      todos.push(entry.value);
    }
  
    return todos;
  };
  
  const getTodo = async (id) => {
    const kv = await Deno.openKv();
    const todo = await kv.get(["todos", id]);
    return todo?.value ?? {};
  };

  const showTodo = async (c) => {
    const id = c.req.param("id");
    const todo = await todoService.getTodo(id);
    return c.text("Found todo: " + JSON.stringify(todo));
  };

  export {deleteTodo, updateTodo, listTodos, showForm, createTodo, getTodo, showTodo};