import admin from "utils/firebase-admin";
import {HTTPForbiddenError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  DELETE: deleteHandler
};

// NOTE: Leave class doesn't delete user data in a class ie. answers, discussion, etc.
async function deleteHandler(req, res) {
  const {id: idClass, mid: idStudent} = req.query;
  const userRef = admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id);
  const clsRef = admin.firestore().collection("classes").doc(idClass);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data();

  if (userData.role !== "student") {
    throw new HTTPForbiddenError("Operasi memerlukan identitas sebagai siswa");
  }

  if (userData.id !== idStudent) {
    throw new HTTPForbiddenError("Operasi tidak diizinkan");
  }

  const classRef = clsRef.collection("students").doc(idStudent);
  const userClassRef = userRef.collection("classes").doc(idClass);
  const batch = admin.firestore().batch();
  batch.delete(classRef);
  batch.delete(userClassRef);
  await batch.commit();
  res.json({message: "Kamu telah keluar dari kelas"});
}

export default withError(withAuth(withMethod(objHandler)));
