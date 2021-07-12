import admin from "utils/firebase-admin";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";
import {withAuth, withMethod, withError} from "utils/server-helpers";

const objHandler = {
  GET: getHandler,
  POST: postHandler
};

async function getHandler(req, res) {
  const {id: idClass, aid: activityId, userId} = req.query;
  const userClass = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass)
    .get();

  if (!userClass.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const activityRef = admin
    .firestore()
    .doc(`classes/${idClass}/activities/${activityId}`);
  const activity = await activityRef.get();

  if (!activity.exists) {
    throw new HTTPNotFoundError("Aktivitas tidak ditemukan");
  }

  if (userId) {
    const answers = await activityRef
      .collection("studentAnswers")
      .doc(userId)
      .collection("answers")
      .get();
    const answersData = answers.docs.map(a => a.data());
    return res.json(answersData);
  }

  const answers = await activityRef.collection("studentAnswers").get();
  const answersData = answers.docs.map(a => a.data());
  res.json(answersData);
}

async function postHandler(req, res) {
  const {id: idClass, aid: activityId} = req.query;
  const {solutionCode, taskItemId} = req.body;
  let userData = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .get();
  userData = userData.data();
  let userClass = await admin
    .firestore()
    .collection("users")
    .doc(userData.id)
    .collection("classes")
    .doc(idClass)
    .get();

  if (!userClass.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  userClass = userClass.data();

  if (userClass.isTeacher) {
    throw new HTTPForbiddenError("Operasi tidak diijinkan");
  }

  const activityRef = admin
    .firestore()
    .doc(`classes/${idClass}/activities/${activityId}`);
  const activity = await activityRef.get();

  if (!activity.exists) {
    throw new HTTPNotFoundError("Aktivitas tidak  ditemukan tidak ditemukan");
  }

  let taskItem = await activityRef
    .collection("taskItems")
    .doc(taskItemId)
    .get();

  if (!taskItem.exists) {
    throw new HTTPNotFoundError("Aktivitas tidak  ditemukan tidak ditemukan");
  }

  taskItem = taskItem.data();

  const studentAnswerRef = activityRef
    .collection("studentAnswers")
    .doc(userData.id);
  const studentAnswer = await studentAnswerRef.get();
  const newAnswerRef = studentAnswerRef.collection("answers").doc(taskItem.id);

  await admin.firestore().runTransaction(async t => {
    if (!studentAnswer.exists) {
      t.set(studentAnswerRef, {
        id: userData.id,
        fullname: userData.fullname,
        avatar: userData.avatar,
        value: null,
        createdAt: new Date().toISOString()
      });
    }

    t.set(newAnswerRef, {
      id: newAnswerRef.id,
      solutionCode,
      taskId: activity.id,
      taskItem: {
        id: taskItem.id,
        title: taskItem.title
      }
    });
  });

  res.json({message: "sukses menyimpan jawaban"});
}

export default withError(withAuth(withMethod(objHandler)));
