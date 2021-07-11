import admin from "utils/firebase-admin";
import {HTTPNotFoundError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  GET: getHandler
};

async function getHandler(req, res) {
  const {id: idClass} = req.query;
  const userClassSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass)
    .get();

  if (!userClassSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const classStudentsSnapshot = await admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("students")
    .get();
  const classStudentsData = classStudentsSnapshot.docs.map(s => s.data());
  res.json(classStudentsData);
}

export default withError(withAuth(withMethod(objHandler)));
