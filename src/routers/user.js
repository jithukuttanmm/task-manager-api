const express = require("express");
const User = require("../modals/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomEmail, sendGoodbyeEmail } = require("../emails/account");
const router = new express.Router();

const upoload = new multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    // callback(undefined, false); // silently fail
    if (!/.(jpg|jpeg|png)$/.test(file.originalname)) x;
    callback(new Error("File must be image/jpg."));
    callback(undefined, true);
  },
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    await sendWelcomEmail(user.email, user.name);
    res.status(201).send({ user: await user.toJSON(), token });
  } catch (error) {
    res.status(400).send(error);
  }
});
// auth - passing middleware to individual routes
router.get("/users/me", auth, async (req, res) => {
  try {
    res.send(await req.user.toJSON());
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/users", auth, async (req, res) => {
  const allowUpdates = ["name", "age", "password", "email"];
  const keys = Object.keys(req.body);
  const isValidOp = keys.every((key) => allowUpdates.includes(key));

  if (!isValidOp) return res.status(400).send("Error: Invalid update");

  try {
    allowUpdates.forEach(
      (update) =>
        (req.user[update] =
          req.body[update] !== undefined ? req.body[update] : req.user[update])
    );
    const result = await req.user.save();
    if (!result) return res.status(404).send({});
    res.send(await req.user.toJSON());
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    await sendGoodbyeEmail(req.user.email, req.user.name);
    res.send(await req.user.toJSON());
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user: await user.toJSON(), token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    const tokenReq = req.header("Authorization").replace("Bearer ", "").trim();
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== tokenReq
    );

    await req.user.save();
    res.send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});
//look for file names avatar .........||
// save it to dir called images...... \/ upoload.single("avatar")

router.post(
  "/users/me/avatar",
  auth,
  upoload.single("avatar"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer(); // image editing.

      req.user.avatar = buffer; //removed dest prop, so file is passde to her
      await req.user.save();
      res.send();
    } catch (error) {
      res.status(500).send(error);
    }
  },
  (error, req, res, next) => {
    res.status(400).send(error.message);
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    req.user = await User.findById(req.params.id);
    if (!(req.user || req.user.avatar)) throw new Error();
    res.set("Content-Type", "image/png");
    res.send(req.user.avatar);
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = router;
