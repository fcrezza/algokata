import admin from "utils/firebase-admin";
import {HTTPNotFoundError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const handlerObj = {
  GET: getHandler,
  POST: postHandler
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

  const discussionRef = admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .doc(discussionId);
  const discussionSnapshot = await discussionRef.get();

  if (!discussionSnapshot.exists) {
    throw new HTTPNotFoundError("Diskusi tidak ditemukan");
  }

  const discussionRepliesSnapshot = await discussionRef
    .collection("replies")
    .orderBy("createdAt", "asc")
    .get();
  const discussionRepliesData = discussionRepliesSnapshot.docs.map(d =>
    d.data()
  );
  res.json(discussionRepliesData);
}

async function postHandler(req, res) {
  const {text} = req.body;
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
    throw new HTTPNotFoundError("Item tidak ditemukan");
  }

  const userSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .get();
  const userData = userSnapshot.data();
  const newReplyRef = admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .doc(discussionId)
    .collection("replies")
    .doc();
  await admin.firestore().runTransaction(async function (t) {
    t.set(newReplyRef, {
      id: newReplyRef.id,
      text,
      author: {
        id: userData.id,
        fullname: userData.fullname,
        avatar: userData.avatar
      },
      createdAt: new Date().toISOString()
    });

    t.update(
      discussionSnapshot.ref,
      {
        repliesCount: admin.firestore.FieldValue.increment(1)
      },
      {merge: true}
    );
  });
  const newReplySnapshot = await newReplyRef.get();
  const newReplyData = newReplySnapshot.data();
  res.json(newReplyData);
}

export default withError(withAuth(withMethod(handlerObj)));
