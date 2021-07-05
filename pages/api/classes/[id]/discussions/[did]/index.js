import admin from "utils/firebase-admin";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";
import {withAuth, withMethod} from "utils/server-helpers";

const handlerObj = {
  GET: getHandler,
  DELETE: deleteHandler
};
async function getHandler(req, res) {
  const {id: classId, did: discussionId} = req.query;
  const userClassRef = admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(classId);
  const cls = await userClassRef.get();

  if (!cls.exists) {
    const error = new HTTPNotFoundError("Kelas tidak ditemukan");
    return res.status(error.code).json({
      ...error,
      message: error.message
    });
  }

  const discussion = await admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .doc(discussionId)
    .get();

  if (!discussion.exists) {
    return res.json({});
  }

  res.json(discussion.data());
}

// NOTE: Delete discussion don't delete its replies
async function deleteHandler(req, res) {
  const {id: idClass, did: discussionId} = req.query;

  const userClassRef = admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass);
  let cls = await userClassRef.get();

  if (!cls.exists) {
    const error = new HTTPNotFoundError("Kelas tidak ditemukan");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  const discussionRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("discussions")
    .doc(discussionId);
  const discussion = await discussionRef.get();

  if (!discussion.exists) {
    const error = new HTTPNotFoundError("Diskusi tidak ditemukan");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  const discussionData = discussion.data();

  if (req.authenticatedUser.user_id !== discussionData.author.id) {
    const error = new HTTPForbiddenError("Operasi tidak diizinkan");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  await discussionRef.delete();
  res.json({message: "Berhasil dihapus"});
}

export default withAuth(withMethod(handlerObj));
