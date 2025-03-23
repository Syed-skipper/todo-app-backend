const { Todo } = require("../model");

exports.createTodo = async (req, res) => {
  try {
    req.body.user = req.user.user_id;
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const { status } = req.query;
    const currentDate = new Date();

    console.log(status);
    let filterDate = { user: req.params.id, completed: false };

    if (status === "today") {
      filterDate.due_date = {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
      };
    } else if (status === "pending") {
      filterDate.due_date = { $lte: new Date() };
    } else if (status === "completed") {
      filterDate.completed = true;
    }
    let findTodos = await Todo.find(filterDate);

    findTodos = findTodos.map((item) => {
      item = item.toObject();
      item.due_date = new Date(item.due_date).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return item;
    });
    return res.status(200).send(findTodos);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

exports.updateTodo = async (req, res) => {
  try {
    console.log(req.body)
    let updated = await Todo.findOneAndUpdate({ _id: req.params.id }, req.body);
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(500).send("Not Updated");
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete({ _id: req.params.id });
    return res.status(200).send("Deleted Successfully");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};
