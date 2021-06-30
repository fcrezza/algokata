import axios from "axios";
import {stringify} from "querystring";
import nookies from "nookies";
import admin from "./firebase-admin";
import {HTTPUnauthorizedError} from "./errors";

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

    const errorData = new HTTPUnauthorizedError(
      "Operasi membutuhkan terauthentikasi"
    );

    throw {
      code: errorData.code,
      status: errorData.status,
      message: errorData.message
    };
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
