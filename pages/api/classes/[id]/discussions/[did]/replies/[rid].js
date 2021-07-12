import {withAuth, withError, withMethod} from "utils/server-helpers";
import admin from "utils/firebase-admin";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";

const handlerObj = {
  DELETE: deleteHandler
};

async function deleteHandler(req, res) {
  const {id: idClass, did: discussionId, rid: replyId} = req.query;

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
  const replyRef = discussionRef.collection("replies").doc(replyId);
  const replySnapshot = await replyRef.get();

  if (!replySnapshot.exists) {
    throw new HTTPNotFoundError("Komentar tidak ditemukan");
  }

  const replyData = replySnapshot.data();

  if (req.authenticatedUser.user_id !== replyData.author.id) {
    throw new HTTPForbiddenError("Operasi tidak diizinkan");
  }

  await admin.firestore().runTransaction(async function (t) {
    t.delete(replyRef);
    t.update(
      discussionRef,
      {
        repliesCount: admin.firestore.FieldValue.increment(-1)
      },
      {merge: true}
    );
  });

  res.json({message: "Komentar berhasil dihapus"});
}

export default withError(withAuth(withMethod(handlerObj)));
