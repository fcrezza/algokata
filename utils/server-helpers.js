import axios from "axios";
import nookies from "nookies";
import {stringify} from "querystring";

import admin from "./firebase-admin";
import {
  HTTPBaseError,
  HTTPMethodNotAllowedError,
  HTTPUnauthorizedError
} from "./errors";

export function withMethod(handlerObj = {}) {
  return async function (req, res) {
    if (handlerObj[req.method] !== undefined) {
      await handlerObj[req.method](req, res);
    } else {
      const allowedMethod = Object.keys(handlerObj);
      res.setHeader("Allow", allowedMethod);
      throw new HTTPMethodNotAllowedError(`Method ${req.method} Not Allowed`);
    }
  };
}

export function withError(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HTTPBaseError) {
        return res.status(error.code).json({
          error: {
            status: error.status,
            code: error.code,
            message: error.message
          }
        });
      }

      res.status(500).json(error.message);
    }
  };
}

export function withAuth(handler) {
  return async function (req, res) {
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    req.authenticatedUser = user;

    if (newIdToken !== null) {
      sendCookie({res}, "refreshToken", refreshToken, 30 * 24 * 60 * 60);
      sendCookie({res}, "idToken", newIdToken, 60 * 60);
    }

    await handler(req, res);
  };
}

export async function verifyIdentity(idToken, refreshToken) {
  try {
    const user = await admin.auth().verifyIdToken(idToken);
    return [user, null];
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      const {data} = await axios({
        url: "https://securetoken.googleapis.com/v1/token?key=AIzaSyAIiwCmIs3yKs9HbxNr5fH1iSSeo5LEJLU",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken
        })
      });

      const user = await admin.auth().verifyIdToken(data.id_token);

      return [user, data.id_token];
    }

    throw new HTTPUnauthorizedError("Operasi membutuhkan terauthentikasi");
  }
}

export function sendCookie(ctx, name, value, expires) {
  nookies.set(ctx, name, value, {
    expires,
    path: "/",
    httpOnly: true
  });
}

export async function batchWrite(snapshot, value) {
  const batchArray = [admin.firestore().batch()];
  let operationCounter = 0;
  let batchIndex = 0;

  snapshot.forEach(d => {
    batchArray[batchIndex].set(d.ref, value, {merge: true});
    operationCounter++;

    if (operationCounter === 499) {
      batchArray.push(admin.firestore().batch());
      batchIndex++;
      operationCounter = 0;
    }
  });

  const result = await Promise.all(batchArray.map(batch => batch.commit()));
  return result;
}
