import admin from "utils/firebase-admin";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";
import {
  batchWrite,
  withAuth,
  withError,
  withMethod
} from "utils/server-helpers";

const handlerObj = {
  GET: getHandler,
  DELETE: deleteHandler
};

async function getHandler(req, res) {
  const {id: classId, did: discussionId} = req.query;
  const userClassSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(classId)
    .get();

  if (!userClassSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const discussionSnapshot = await admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .doc(discussionId)
    .get();

  if (!discussionSnapshot.exists) {
    throw new HTTPNotFoundError("Diskusi tidak ditemukan");
  }

  const discussionData = discussionSnapshot.data();
  res.json(discussionData);
}

// NOTE: Delete discussion include delete its replies
async function deleteHandler(req, res) {
  const {id: idClass, did: discussionId} = req.query;
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

  const discussionRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("discussions")
    .doc(discussionId);
  const discussionSnapshot = await discussionRef.get();
  const discussionRepliesSnapshot = await discussionRef
    .collection("replies")
    .get();

  if (!discussionSnapshot.exists) {
    throw new HTTPNotFoundError("Diskusi tidak ditemukan");
  }

  const discussionData = discussionSnapshot.data();

  if (req.authenticatedUser.user_id !== discussionData.author.id) {
    throw new HTTPForbiddenError("Operasi tidak diizinkan");
  }

  await discussionRef.delete();
  await batchWrite(discussionRepliesSnapshot, null, "delete");
  res.json({message: "Diskusi berhasil dihapus"});
}

export default withError(withAuth(withMethod(handlerObj)));
