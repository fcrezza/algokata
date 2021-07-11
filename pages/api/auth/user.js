import admin from "utils/firebase-admin";
import {
  sendCookie,
  verifyIdentity,
  withError,
  withMethod
} from "utils/server-helpers";

const objHandler = {
  GET: handler
};

async function handler(req, res) {
  try {
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const userSnapshot = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .get();

    if (newIdToken !== null) {
      sendCookie({res}, "refreshToken", refreshToken, 30 * 24 * 60 * 60);
      sendCookie({res}, "idToken", newIdToken, 60 * 60);
    }

    const userData = userSnapshot.data();
    res.json(userData);
  } catch (err) {
    res.json({});
  }
}

export default withError(withMethod(objHandler));
