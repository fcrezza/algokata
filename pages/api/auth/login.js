import admin from "utils/firebase-admin";
import {sendCookie, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  POST: handler
};

async function handler(req, res) {
  const {isNewUser, idToken, refreshToken} = req.body;
  const {user_id, name, picture, email} = await admin
    .auth()
    .verifyIdToken(idToken);

  if (isNewUser) {
    await admin.firestore().collection("users").doc(user_id).create({
      id: user_id,
      email,
      fullname: name,
      avatar: picture,
      role: null,
      createdAt: new Date().toISOString()
    });
  }

  const userSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(user_id)
    .get();
  const userData = userSnapshot.data();
  sendCookie({res}, "idToken", idToken, 60 * 60);
  sendCookie({res}, "refreshToken", refreshToken, 30 * 24 * 60 * 60);
  res.json(userData);
}

export default withError(withMethod(objHandler));
