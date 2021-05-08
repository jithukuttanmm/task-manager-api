const jwt = require("jsonwebtoken");
const User = require("../modals/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "").trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ _id: decoded, "tokens.token": token }); // subdomain get of tokens

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ Error: "Please authenticate." });
  }
};

module.exports = auth;
