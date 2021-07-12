import admin from "utils/firebase-admin";
import {
  HTTPForbiddenError,
  HTTPNotFoundError,
  HTTPUnauthorizedError
} from "utils/errors";
import {
  batchWrite,
  withAuth,
  withError,
  withMethod
} from "utils/server-helpers";

const objHandler = {
  DELETE: deleteHandler,
  PUT: putHandler,
  GET: getHandler
};

// This handler used to delete announcement / task in a class
async function deleteHandler(req, res) {
  const {id: idClass, aid: activityId} = req.query;
  const classSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass)
    .get();

  if (!classSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const classData = classSnapshot.data();

  if (!classData.isTeacher) {
    throw new HTTPUnauthorizedError("Operasi membutuhkan autentikasi");
  }

  const activityRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("activities")
    .doc(activityId);
  const activitySnapshot = await activityRef.get();

  if (!activitySnapshot.exists) {
    throw new HTTPNotFoundError("Item tidak ditemukan");
  }

  const activityData = activitySnapshot.data();

  if (activityData.type === "task") {
    const taskItemsSnapshot = await activityRef.collection("taskItems").get();
    const studentAnswerItemsSnapshot = await admin
      .firestore()
      .collectionGroup("answers")
      .where("taskId", "==", activityId)
      .get();
    const studentAnswersSnapshot = await activityRef
      .collection("studentAnswers")
      .get();
    const feedbacksSnapshot = await activityRef.collection("feedbacks").get();
    await batchWrite(taskItemsSnapshot, null, "delete");
    await batchWrite(studentAnswerItemsSnapshot, null, "delete");
    await batchWrite(studentAnswersSnapshot, null, "delete");
    await batchWrite(feedbacksSnapshot, null, "delete");
    await activityRef.delete();
  } else {
    await activitySnapshot.ref.delete();
  }

  res.json({status: "Success", message: "Item berhasil dihapus"});
}

// This handler used to get a task
async function getHandler(req, res) {
  const {id: idClass, aid: activityId} = req.query;
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

  const activitySnapshot = await admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("activities")
    .doc(activityId)
    .get();

  if (!activitySnapshot.exists) {
    throw new HTTPNotFoundError("Item tidak ditemukan");
  }

  const activityData = activitySnapshot.data();
  res.json(activityData);
}

/*
NOTE : This handler used to update task fields.
       This include update class field in taskItems collection
*/
async function putHandler(req, res) {
  const {id: idClass, aid: activityId} = req.query;
  const {title, description} = req.body;
  let userClassSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass)
    .get();

  if (!userClassSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const userClassData = userClassSnapshot.data();

  if (!userClassData.isTeacher) {
    throw new HTTPForbiddenError("Operasi tidak diizinkan");
  }

  const taskRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("activities")
    .doc(activityId);
  const taskSnapshot = await taskRef.get();

  if (!taskSnapshot.exists) {
    throw new HTTPNotFoundError("Item tidak ditemukan");
  }

  const taskItemsSnapshot = await taskRef.collection("taskItems").get();
  await taskRef.update({title, description});
  await batchWrite(taskItemsSnapshot, {task: {title}});
  const newTaskSnapshot = await taskRef.get();
  const newTaskData = newTaskSnapshot.data();
  res.json(newTaskData);
}

export default withError(withAuth(withMethod(objHandler)));
