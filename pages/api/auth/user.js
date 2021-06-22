import {HTTPMethodNotAllowedError} from "utils/errors";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const {idToken, refreshToken} = req.cookies;
      const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
      const userData = await admin
        .firestore()
        .collection("users")
        .doc(user.user_id)
        .get();

      if (newIdToken !== null) {
        sendCookie({res}, "idToken", newIdToken);
      }

      res.json({...userData.data()});
    } catch (err) {
      res.json({});
    }
  } else {
    const error = new HTTPMethodNotAllowedError(
      `Method ${req.method} Not Allowed`
    );
    res.setHeader("Allow", ["GET"]);
    res.status(error.code).json(error);
  }
}
