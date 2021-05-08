const express = require("express");
const mongoose = require("./db/mongoose"); //to ensure it runs paralell
const userRouter = require("./routers/user");
const taskRouter = require("./routers/tasks");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT;

app.use(express.json()); //get req params as json
app.use(userRouter);
app.use(taskRouter);
app.listen(port, () => {
  console.log("Server started at port ", port);
});
