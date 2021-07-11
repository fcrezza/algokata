import {HTTPForbiddenError} from "utils/errors";
import admin from "utils/firebase-admin";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  POST: handler
};

async function handler(req, res) {
  const {role} = req.body;
  const userSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .get();
  const userData = userSnapshot.data();

  if (userData.role !== null) {
    throw new HTTPForbiddenError("Role pengguna tidak dapat dirubah");
  }

  await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .update({
      role
    });
  res.json({
    message: "success update"
  });
}

export default withError(withAuth(withMethod(objHandler)));
