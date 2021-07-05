import admin from "utils/firebase-admin";
import {HTTPNotFoundError} from "utils/errors";
import {withAuth, withMethod} from "utils/server-helpers";

const handlerObj = {
  GET: getHandler,
  POST: postHandler
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
      error: {
        ...error,
        message: error.message
      }
    });
  }

  const discussionRef = admin
    .firestore()
    .collection("classes")
    .doc(classId)
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

  const discussionReplies = await discussionRef
    .collection("replies")
    .orderBy("createdAt", "asc")
    .get();
  const discussionRepliesData = discussionReplies.docs.map(d => d.data());
  res.json(discussionRepliesData);
}

async function postHandler(req, res) {
  const {text} = req.body;
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
      error: {
        ...error,
        message: error.message
      }
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
    const error = new HTTPNotFoundError("Item tidak ditemukan");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  const user = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .get();
  const userData = user.data();
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
      discussion.ref,
      {
        repliesCount: admin.firestore.FieldValue.increment(1)
      },
      {merge: true}
    );
  });

  const newReply = await newReplyRef.get();
  res.json(newReply.data());
}

export default withAuth(withMethod(handlerObj));
