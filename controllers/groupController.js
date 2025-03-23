const { Group, Todo } = require("../model");

exports.createGroup = async (req, res) => {
  try {
    req.body.user = req.user.user_id;
    let group = new Group(req.body);
    await group.save();
    res.status(201).json({ message: "Group created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    let findGroup = await Group.find({ members: req.params.id });
    return res.status(200).send(findGroup);
  } catch (error) {
    return res.status(500).send(error);
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const updatedGroup = await Group.findOneAndUpdate(
      { invite_code: req.body.invite_code },
      { $addToSet: { members: req.params.id } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).send("Group not found");
    }
    return res.status(200).send("Group Updated Successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Group.findOneAndDelete({_id: req.params.id})
    return res.status(200).send("Group deleted");
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

exports.getGroupAllTask = async (req, res) => {
  try {
    let getAll = await Group.find({ _id: req.params.id });
    if (!getAll) return res.status(500).send("Group not found");

    let getAllTask = await Todo.find({ user: getAll[0].members });
    getAllTask = getAllTask.map((item) => {
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
    return res.status(200).send(getAllTask);
  } catch (error) {
    return res.status(500).send("Interna; server error");
  }
};
