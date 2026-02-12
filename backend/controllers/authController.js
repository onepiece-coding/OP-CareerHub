const User = require("../models/User.js");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const JWTGenerator = require("../utils/generateJWT.js");
const Notification = require("../models/Notification.js");
const { sendNotification } = require("../services/socketService.js");

/**-------------------------------------------
 * @desc   Register New User
 * @route  /api/v1/auth/register
 * @method POST
 * @access public
----------------------------------------------*/
module.exports.registerUser = async (req, res, next) => {
  try {
    const isUserExists = await User.findOne({ email: req.body.email });
    if (isUserExists) {
      return next(createError(500, "Email Existe déjà"));
    } else {
      const isFirstUser = (await User.countDocuments()) === 0;
      req.body.role = isFirstUser ? "admin" : "user";
      const newUser = new User(req.body);
      const savedUser = await newUser.save();

      // Exclude(remove) password field from the result
      const { password, ...userWithoutPassword } = savedUser.toObject();

      // if token not neede comment the code down bottom and don't send token
      const tokenPayload = { ID: savedUser._id, email: savedUser.email };
      const TOKEN = JWTGenerator(tokenPayload, "1d");

      return res.status(201).json({
        status: true,
        message: "Enregistré avec succès",
        result: userWithoutPassword,
        TOKEN,
      });
    }
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**-------------------------------------------
 * @desc   Login User
 * @route  /api/v1/auth/login
 * @method POST
 * @access public
----------------------------------------------*/
module.exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
      const isPasswordMatched = await bcrypt.compare(
        password,
        isUserExists.password
      );
      if (isPasswordMatched) {
        const tokenPayload = {
          ID: isUserExists._id,
          role: isUserExists.role,
        };
        const TOKEN = JWTGenerator(tokenPayload);

        const one_day = 1000 * 60 * 60 * 24; //since token expire in 1day

        res.cookie(process.env.COOKIE_NAME, TOKEN, {
          expires: new Date(Date.now() + one_day),
          secure: true, // Sent only over HTTPS
          httpOnly: true, // Restricts access from client-side scripts
          signed: true, // Helps keep the cookie secure
          sameSite: "None",
        });

        // Step 1: Fetch Unread Notifications
        const unreadNotifications = await Notification.find({
          recipient: isUserExists._id,
          read: false,
        });

        // Step 2: Send Real-Time Notifications
        unreadNotifications.forEach((notification) => {
          sendNotification(notification.recipient, notification);
        });

        return res.status(200).json({
          status: true,
          message: "Connexion réussie",
          unreadNotificationsCount: unreadNotifications.length,
        });
      } else {
        return next(
          createError(401, "L'e-mail ou le mot de passe ne correspondent pas")
        );
      }
    } else {
      return next(createError(404, "Utilisateur non trouvé!"));
    }
  } catch (error) {
    next(createError(500, `Quelque chose ne va pas: ${error.message}`));
  }
};

/**------------------------------------
 * @desc   Get Current Logged-in User
 * @route  /api/v1/auth/me
 * @method GET
 * @access private (only user himself)
---------------------------------------*/
module.exports.getMe = async (req, res, next) => {
  try {
    const me = req.user;
    if (!me) {
      return next(createError(401, "Veuillez d'abord vous connecter"));
    }
    return res.status(200).json({
      status: true,
      result: me,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**-------------------------------------------
 * @desc   Log out Current User (clear cookie)
 * @route  /api/v1/auth/logout
 * @method POST
 * @access private (only user himself)
----------------------------------------------*/
module.exports.logoutUser = async (req, res, next) => {
  try {
    return res
      .cookie(process.env.COOKIE_NAME, "", {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        expires: new Date(0), // Set to a date in the past
        path: "/", // Ensure this matches the path set during login
      })
      .status(200)
      .json({
        status: true,
        message: "Déconnexion réussie",
      });
  } catch (error) {
    next(createError(500, error.message));
  }
};
