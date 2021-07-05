import {withAuth, withMethod} from "utils/server-helpers";
import admin from "utils/firebase-admin";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";

const handlerObj = {
  DELETE: deleteHandler
};

async function deleteHandler(req, res) {
  const {id: idClass, did: discussionId, rid: replyId} = req.query;

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

  const replyRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("discussions")
    .doc(discussionId)
    .collection("replies")
    .doc(replyId);
  const reply = await replyRef.get();

  if (!reply.exists) {
    const error = new HTTPNotFoundError("Komentar tidak ditemukan");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  const replyData = reply.data();

  if (req.authenticatedUser.user_id !== replyData.author.id) {
    const error = new HTTPForbiddenError("Operasi tidak diizinkan");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  await replyRef.delete();
  res.json({message: "Berhasil dihapus"});
}

export default withAuth(withMethod(handlerObj));
