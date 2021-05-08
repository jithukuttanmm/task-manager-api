const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../modals/task");
const User = require("../modals/user");
const router = new express.Router();

router.post("/task", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    const result = await task.save();
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
// task?completed=true/false
// task?limit:10&skip=10
// task?sortBy=createdAt:desc
router.get("/task", auth, async (req, res) => {
  try {
    //virtual mapping get
    let match = {};
    if (req.query.completed)
      match = { completed: req.query.completed === "true" };
    let sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit), // no validation needed, mongoose handles it
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.send(error);
  }
});

router.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const result = await Task.findOne({ _id, owner: req.user._id });

    if (!result) return res.status(404).send();
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.patch("/task/:id", auth, async (req, res) => {
  const allowUpdates = ["description", "completed"];
  const keys = Object.keys(req.body);
  const isValidOp = keys.every((key) => allowUpdates.includes(key));
  if (!isValidOp) return res.status(400).send("Error : invalid update");

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(400).send({});

    allowUpdates.forEach(
      (update) =>
        (task[update] =
          req.body[update] !== undefined ? req.body[update] : task[update])
    );
    const result = await task.save();
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
