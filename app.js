const express = require("express");
const app = express();
app.use(express.json());
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const addDays = require("date-fns");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
  app.listen(3000, () => {
    console.log("Server Running at http://localhost:3000");
  });
};

initializeDBAndServer();

// ConvertDBObjectToTodosResponseObject
const ConvertDBObjectToTodosResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

// GET Todos API 1

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let selectTodosQuery = "";
  let todosArray = null;
  if (
    priority !== undefined &&
    status !== undefined &&
    category !== undefined
  ) {
    selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND priority = '${priority}'
                    AND status = '${status}'
                    AND category = '${category}';`;
    todosArray = await db.all(selectTodosQuery);
    response.send(
      todosArray.map((eachTodo) =>
        ConvertDBObjectToTodosResponseObject(eachTodo)
      )
    );
  } else if (priority !== undefined && status !== undefined) {
    selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND priority = '${priority}'
                    AND status = '${status}';`;
    todosArray = await db.all(selectTodosQuery);
    response.send(
      todosArray.map((eachTodo) =>
        ConvertDBObjectToTodosResponseObject(eachTodo)
      )
    );
  } else if (status !== undefined && category !== undefined) {
    selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND category = '${category}'
                    AND status = '${status}';`;
    todosArray = await db.all(selectTodosQuery);
    response.send(
      todosArray.map((eachTodo) =>
        ConvertDBObjectToTodosResponseObject(eachTodo)
      )
    );
  } else if (priority !== undefined && category !== undefined) {
    selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND category = '${category}'
                    AND priority = '${priority}';`;
    todosArray = await db.all(selectTodosQuery);
    response.send(
      todosArray.map((eachTodo) =>
        ConvertDBObjectToTodosResponseObject(eachTodo)
      )
    );
  } else if (category !== undefined) {
    const is_category = await db.get(
      `select category from todo where category ='${category}';`
    );
    if (is_category === undefined) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND category = '${category}';`;
      todosArray = await db.all(selectTodosQuery);
      response.send(
        todosArray.map((eachTodo) =>
          ConvertDBObjectToTodosResponseObject(eachTodo)
        )
      );
    }
  } else if (status !== undefined) {
    const is_status = await db.get(
      `select status from todo where status ='${status}';`
    );

    if (is_status === undefined) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND status = '${status}';`;
      todosArray = await db.all(selectTodosQuery);
      response.send(
        todosArray.map((eachTodo) =>
          ConvertDBObjectToTodosResponseObject(eachTodo)
        )
      );
    }
  } else if (priority !== undefined) {
    const is_priority = await db.get(
      `select priority from todo where priority ='${priority}';`
    );

    if (is_priority === undefined) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%'
                    AND priority = '${priority}';`;
      todosArray = await db.all(selectTodosQuery);
      response.send(
        todosArray.map((eachTodo) =>
          ConvertDBObjectToTodosResponseObject(eachTodo)
        )
      );
    }
  } else {
    selectTodosQuery = `
                SELECT * 
                FROM 
                    todo
                WHERE 
                    todo LIKE '%${search_q}%';`;
    todosArray = await db.all(selectTodosQuery);
    response.send(
      todosArray.map((eachTodo) =>
        ConvertDBObjectToTodosResponseObject(eachTodo)
      )
    );
  }
});

//GET Todo API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const selectTododQuery = `
        SELECT * FROM
            todo
        WHERE id = ${todoId};`;
  const todo = await db.get(selectTododQuery);
  response.send(ConvertDBObjectToTodosResponseObject(todo));
});

const formatDate = (date) => {
  let formattedDate = format(new Date(date), "yyyy-MM-dd");
  return formattedDate;
};

const convertDbToResponse = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

// GET agenda API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  try {
    if (date !== undefined) {
      const formattedDate = formatDate(date);
      const isDateValid = isValid(new Date(formattedDate));
      if (isDateValid === true) {
        const getTodoQuery = `
                SELECT
                *
                FROM
                todo
                WHERE 
                due_date = '${formattedDate}';
                `;
        todo = await db.all(getTodoQuery);
        response.send(todo.map((each) => convertDbToResponse(each)));
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } catch (e) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// CREATE Todo API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const selectStatusQuery = `SELECT * FROM todo WHERE status ='${status}';`;
  const todoStatus = await db.get(selectStatusQuery);
  if (todoStatus === undefined) {
    response.status(400);
    response.send("Invalid Todo Status");
  }

  const selectPriorityQuery = `SELECT * FROM todo WHERE  priority='${priority}';`;
  const todoPriority = await db.get(selectPriorityQuery);
  if (todoPriority === undefined) {
    response.status(400);
    response.send("Invalid Todo Priority");
  }

  const selectCategoryQuery = `SELECT * FROM todo WHERE  category='${category}';`;
  const todoCategory = await db.get(selectCategoryQuery);
  if (todoCategory === undefined) {
    response.status(400);
    response.send("Invalid Todo Category");
  }
  let formattedDate;

  date = dueDate.split("-");

  if (date.length === 3) {
    formattedDate = format(
      new Date(date[0], date[1] - 1, date[2]),
      "yyyy-MM-dd"
    );
  }
  console.log(formattedDate);
  if (formattedDate === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  }

  if (
    todoStatus !== undefined &&
    todoPriority !== undefined &&
    todoCategory !== undefined &&
    formattedDate !== undefined
  ) {
    const createTodoQuery = `
        INSERT INTO todo (id,todo,category,priority,status,due_date)
        VALUES (${id},'${todo}','${category}','${priority}','${status}','${formattedDate}');`;
    await db.run(createTodoQuery);
    response.send("Todo Successfully Added");
  }
});

//UPDATE TODO API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todo, status, priority, category, dueDate } = request.body;
  const { todoId } = request.params;

  if (todo !== undefined) {
    const updateTodoQuery = `UPDATE  todo
                                 SET todo = '${todo}'
                                 WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const updateTodoQuery = `UPDATE  todo
                                 SET status = '${status}'
                                 WHERE id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (priority !== undefined) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const updateTodoQuery = `UPDATE todo
                                 SET priority = '${priority}'
                                 WHERE id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const updateTodoQuery = `UPDATE  todo
                                 SET category = '${category}'
                                 WHERE id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (dueDate !== undefined) {
    let formattedDate;
    const date = dueDate.split("-");
    console.log(date.length);
    if (date.length !== 3) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      formattedDate = format(
        new Date(date[0], date[1] - 1, date[2]),
        "yyyy-MM-dd"
      );
      if (formattedDate !== undefined) {
        const updateTodoQuery = `UPDATE  todo
                                 SET due_date = '${formattedDate}'
                                 WHERE id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      }
    }
  }
});

//Delete Todo API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
