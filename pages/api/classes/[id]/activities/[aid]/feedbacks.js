import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";
import admin from "utils/firebase-admin";
import {withAuth, withError, withMethod} from "utils/server-helpers";

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
    const feedbackSnapshot = await activityRef
      .collection("feedbacks")
      .doc(userId)
      .get();

    if (!feedbackSnapshot.exists) {
      throw new HTTPNotFoundError("Item tidak ditemukan");
    }

    const feedbackData = feedbackSnapshot.data();
    return res.json(feedbackData);
  }

  const feedbacksSnapshot = await activityRef.collection("feedbacks").get();
  const feedbacksData = feedbacksSnapshot.docs.map(a => a.data());
  res.json(feedbacksData);
}

async function postHandler(req, res) {
  const {id: idClass, aid: activityId} = req.query;
  const {studentId, value, message} = req.body;
  const userRef = admin.firestore().collection("users");
  const teacherClass = await userRef
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass)
    .get();
  const studentClass = await userRef
    .doc(studentId)
    .collection("classes")
    .doc(idClass)
    .get();

  if (!teacherClass.exists || !studentClass.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const teacherClassData = teacherClass.data();
  const studentClassData = studentClass.data();

  if (!teacherClassData.isTeacher) {
    throw new HTTPForbiddenError(
      "Operasi membutuhkan role sebagai pengajar kelas"
    );
  }

  if (studentClassData.isTeacher) {
    throw new HTTPForbiddenError("Pengajar hanya bisa menilai siswa");
  }

  const activityRef = admin
    .firestore()
    .doc(`classes/${idClass}/activities/${activityId}`);
  const activity = await activityRef.get();

  if (!activity.exists) {
    throw new HTTPNotFoundError("Aktivitas tidak ditemukan");
  }

  const studentFeedbackRef = activityRef.collection("feedbacks").doc(studentId);
  const studentAnswerSnapshot = await activityRef
    .collection("studentAnswers")
    .doc(studentId)
    .get();

  if (!studentAnswerSnapshot.exists) {
    throw new HTTPNotFoundError("Jawaban tidak ditemukan");
  }

  await admin.firestore().runTransaction(async t => {
    t.set(studentFeedbackRef, {
      id: studentId,
      value,
      message,
      createdAt: new Date().toISOString()
    });
    t.set(
      studentAnswerSnapshot.ref,
      {
        value
      },
      {
        merge: true
      }
    );
  });

  const studentFeedbackSnapshot = await studentFeedbackRef.get();
  const studentFeedbackData = studentFeedbackSnapshot.data();
  return res.json(studentFeedbackData);
}

export default withError(withAuth(withMethod(objHandler)));
