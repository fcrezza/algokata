import {
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError
} from "utils/errors";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;

    case "POST":
      await postHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function getHandler(req, res) {
  try {
    const {id: idClass, aid: activityId, userId} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const userClass = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .collection("classes")
      .doc(idClass)
      .get();

    if (!userClass.exists) {
      const error = new HTTPNotFoundError("Kelas tidak ditemukan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const activityRef = admin
      .firestore()
      .doc(`classes/${idClass}/activities/${activityId}`);
    const activity = await activityRef.get();

    if (!activity.exists) {
      const error = new HTTPNotFoundError(
        "Aktivitas tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    let answers;

    if (userId) {
      answers = await activityRef
        .collection("studentAnswers")
        .doc(userId)
        .collection("answers")
        .get();
    } else {
      answers = await activityRef.collection("studentAnswers").get();
    }

    const answersData = answers.docs.map(a => a.data());

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(answersData);
  } catch (error) {
    console.log(error);
    if (error.code === 401) {
      return res
        .status(error.code)
        .json({error: {status: error.status, message: error.message}});
    }

    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res
      .status(errorData.code)
      .json({error: {...errorData, message: errorData.message}});
  }
}

async function postHandler(req, res) {
  try {
    const {id: idClass, aid: activityId} = req.query;
    const {solutionCode, taskItemId} = req.body;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userData = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
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
      const error = new HTTPNotFoundError("Kelas tidak ditemukan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    userClass = userClass.data();

    if (userClass.isTeacher) {
      const error = new HTTPForbiddenError("Operasi tidak diijinkan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const activityRef = admin
      .firestore()
      .doc(`classes/${idClass}/activities/${activityId}`);
    const activity = await activityRef.get();

    if (!activity.exists) {
      const error = new HTTPNotFoundError(
        "Aktivitas tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    let taskItem = await activityRef
      .collection("taskItems")
      .doc(taskItemId)
      .get();

    if (!taskItem.exists) {
      const error = new HTTPNotFoundError(
        "Aktivitas tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    taskItem = taskItem.data();

    const studentAnswerRef = activityRef
      .collection("studentAnswers")
      .doc(userData.id);
    const studentAnswer = await studentAnswerRef.get();
    const newAnswerRef = studentAnswerRef
      .collection("answers")
      .doc(taskItem.id);

    await admin.firestore().runTransaction(async t => {
      if (!studentAnswer.exists) {
        t.set(studentAnswerRef, {
          id: userData.id,
          fullname: userData.fullname,
          avatar: userData.avatar,
          createdAt: new Date().toISOString()
        });
      }

      t.set(newAnswerRef, {
        id: newAnswerRef.id,
        solutionCode,
        taskItem: {
          id: taskItem.id,
          title: taskItem.title
        }
      });
    });

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json({message: "sukses menyimpan jawaban"});
  } catch (error) {
    console.log(error);
    if (error.code === 401) {
      return res
        .status(error.code)
        .json({error: {status: error.status, message: error.message}});
    }

    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res
      .status(errorData.code)
      .json({error: {...errorData, message: errorData.message}});
  }
}
