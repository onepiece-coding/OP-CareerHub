import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import User from '../models/User.js';
import { randomBytes, createHash } from 'crypto';
import VerificationToken from '../models/VerificationToken.js';
import RefreshToken from '../models/RefreshToken.js';
import sendEmail from '../utils/sendEmail.js';
import { env } from '../env.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { sendNotification } from '../services/socketService.js';
import Notification from '../models/Notification.js';

/**
 * Cookie helpers
 */
const ACCESS_COOKIE_NAME = 'access_token';
const REFRESH_COOKIE_NAME = 'refresh_token';

function getCookieOptions({ isRefresh = false } = {}) {
  const secure = env.COOKIE_SECURE ?? env.NODE_ENV === 'production';
  const maxAge = isRefresh
    ? Number(env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7) * 1000
    : Number(env.ACCESS_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 15) * 1000;

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    // domain: set if you want shared cookies across subdomains (optional)
  };
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/**----------------------------------
 * @desc   Register New User
 * @route  /api/v1/auth/register
 * @method POST
 * @access public
-------------------------------------*/
export const registerUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password, gender, location } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      throw createError(400, 'User already exists!');
    }

    let role = 'user';

    const countUsers = await User.countDocuments();
    if (countUsers === 0) role = 'admin';

    user = new User({
      username,
      email,
      password,
      role,
      gender,
      location,
    });

    await user.save();

    // Creating new VerificationToken & send it to Db
    const verificationToken = new VerificationToken({
      userId: user._id,
      token: randomBytes(32).toString('hex'),
    });

    await verificationToken.save();

    // Making the link
    const link = `${env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

    // Putting the link itno an html template
    const htmlTemplate = `
    <div>
      <p>Click on the link bellow to verify your email</p>
      <a href="${link}">Verify</a>
    </div>`;

    // Sending email to the user
    const emailPayload = {
      to: user.email,
      subject: 'Verify Your Email',
      html: htmlTemplate,
    };
    await sendEmail(emailPayload);

    // Response
    res.status(201).json({
      message:
        'We sent a verification link to your email, please verify your email address',
    });
  },
);

/**----------------------------------
 * @desc   Login User
 * @route  /api/v1/auth/login
 * @method POST
 * @access public
-------------------------------------*/
export const loginUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || (await user.comparePassword(password)) === false) {
      throw createError(400, 'Invalid Credentials!');
    }

    // sending email(verify account if not verified);
    if (!user.isAccountVerified) {
      let verificationToken = await VerificationToken.findOne({
        userId: user._id,
      });

      if (!verificationToken) {
        verificationToken = new VerificationToken({
          userId: user._id,
          token: randomBytes(32).toString('hex'),
        });

        await verificationToken.save();
      }

      const link = `${env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

      const htmlTemplate = `
      <div>
        <p>Click on the link bellow to verify your email</p>
        <a href="${link}">Verify</a>
      </div>`;

      const emailPayload = {
        to: user.email,
        subject: 'Verify Your Email',
        html: htmlTemplate,
      };
      await sendEmail(emailPayload);

      res.status(400).json({
        message:
          'We sent a verification link to your email, please verify your email address',
      });
      return;
    }

    const payload = { id: user._id.toString(), role: user.role };

    // create access token
    const accessToken = signAccessToken(payload);

    // create refresh token JWT that includes a server tokenId (we use random id)
    const tokenId = randomBytes(16).toString('hex');
    const refreshJwt = signRefreshToken({
      id: user._id.toString(),
      tokenId,
      role: user.role,
    });

    // store hashed refresh token in DB for rotation / revocation
    const tokenHash = hashToken(refreshJwt);
    const expiresAt = new Date(
      Date.now() +
        Number(env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7) * 1000,
    );
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    // set cookies
    res.cookie(
      ACCESS_COOKIE_NAME,
      accessToken,
      getCookieOptions({ isRefresh: false }),
    );
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshJwt,
      getCookieOptions({ isRefresh: true }),
    );

    // omit password
    const userSafe = user.toObject();
    // @ts-ignore
    delete userSafe.password;

    // Fetch Unread Notifications
    const unreadNotifications = await Notification.find({
      recipient: user._id,
      read: false,
    });

    // Send Real-Time Notifications
    unreadNotifications.forEach((notification) => {
      sendNotification(notification.recipient.toString(), notification);
    });

    res.status(200).json({
      user: userSafe,
      expiresIn: new Date(
        Date.now() +
          Number(env.ACCESS_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 15) * 1000,
      ),
      unreadNotificationsCount: unreadNotifications.length,
    });
  },
);

/**----------------------------------
 * @desc   Refresh: rotate refresh token and issue new access token (and rotate refresh token)
 * @route  /api/v1/auth/refresh
 * @method POST
 * @access public
-------------------------------------*/
export const refreshTokenCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!raw) {
      throw createError(401, 'No refresh token provided');
    }

    // verify signature first
    let payload: import('../utils/jwt.js').RefreshTokenPayload;
    try {
      payload = verifyRefreshToken(raw);
    } catch {
      throw createError(401, 'Invalid refresh token');
    }

    // find stored hashed token
    const tokenHash = hashToken(raw);
    const stored = await RefreshToken.findOne({ tokenHash });
    if (!stored) {
      throw createError(401, 'Refresh token not recognized');
    }
    if (stored.revoked) {
      throw createError(401, 'Refresh token revoked');
    }
    if (stored.expiresAt < new Date()) {
      throw createError(401, 'Refresh token expired');
    }

    // Load the current user from DB
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      // remove token as cleanup if desired
      await stored.deleteOne();
      throw createError(401, 'User not found');
    }

    // rotate: remove existing stored refresh token
    await stored.deleteOne();

    // sign a new refresh token including role from DB
    const tokenId = randomBytes(16).toString('hex');
    const newRefreshJwt = signRefreshToken({
      id: user._id.toString(),
      tokenId,
      role: user.role,
    });

    const newTokenHash = hashToken(newRefreshJwt);
    const newExpiresAt = new Date(
      Date.now() +
        Number(env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7) * 1000,
    );

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
      revoked: false,
    });

    // issue a new access token using authoritative role from DB
    const accessToken = signAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    // set cookies (overwrite)
    res.cookie(
      ACCESS_COOKIE_NAME,
      accessToken,
      getCookieOptions({ isRefresh: false }),
    );
    res.cookie(
      REFRESH_COOKIE_NAME,
      newRefreshJwt,
      getCookieOptions({ isRefresh: true }),
    );

    // return current user
    res.status(200).json({ user });
  },
);

/**----------------------------------
 * @desc   Logout: remove refresh from DB and clear cookies
 * @route  /api/v1/auth/logout
 * @method POST
 * @access private (logged in users)
-------------------------------------*/
export const logoutCtrl = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME];
  if (raw) {
    const tokenHash = hashToken(raw);
    await RefreshToken.deleteOne({ tokenHash });
  }

  // clear cookies on client
  res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });

  res.status(200).json({ message: 'Logged out' });
});

/**----------------------------------
 * @desc   Get Current Logged-in User
 * @route  /api/v1/auth/me
 * @method GET
 * @access private (only user himself)
-------------------------------------*/
export const getMeCtrl = asyncHandler(async (req: Request, res: Response) => {
  const me = await User.findById(req.user.id).select('-password');
  if (!me) {
    throw createError(401, 'Please login first!');
  }

  res.status(200).json({
    status: true,
    result: me,
  });
});

/**----------------------------------
 * @desc   Verify User Account
 * @route  /api/v1/auth/:userId/verify/:token
 * @method Get
 * @access public
-------------------------------------*/
export const verifyUserAccountCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw createError(400, 'Invalid link');
    }

    const verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!verificationToken) {
      throw createError(400, 'Invalid link');
    }

    user.isAccountVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res
      .status(200)
      .json({ success: true, message: 'Your account has been verified' });
  },
);
