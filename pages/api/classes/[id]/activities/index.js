import admin from "utils/firebase-admin";
import {HTTPNotFoundError, HTTPUnauthorizedError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  GET: getHandler,
  POST: postHandler
};

async function getHandler(req, res) {
  const {id: idClass, type, order} = req.query;
  const userClassSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(idClass)
    .get();
  let activitiesSnapshot;

  if (!userClassSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  if (type) {
    activitiesSnapshot = await admin
      .firestore()
      .collection("classes")
      .doc(idClass)
      .collection("activities")
      .where("type", "==", type)
      .orderBy("createdAt", order)
      .get();
  } else {
    activitiesSnapshot = await admin
      .firestore()
      .collection("classes")
      .doc(idClass)
      .collection("activities")
      .orderBy("createdAt", order)
      .get();
  }

  const activitiesData = activitiesSnapshot.docs.map(a => a.data());
  res.json(activitiesData);
}

async function postHandler(req, res) {
  const {id: idClass} = req.query;
  const {title, description, message, type} = req.body;
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

  const userClassData = userClassSnapshot.data();

  if (!userClassData.isTeacher) {
    throw new HTTPUnauthorizedError("Operasi tidak  diizinkan");
  }

  const newActivityRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("activities")
    .doc();
  const createdAt = new Date().toISOString();

  if (type === "announcement") {
    await newActivityRef.set({
      id: newActivityRef.id,
      title,
      message,
      type,
      createdAt
    });
  } else if (type === "task") {
    await newActivityRef.set({
      id: newActivityRef.id,
      title,
      description,
      type,
      taskItems: [],
      createdAt
    });
  }

  const newActivitySnapshot = await newActivityRef.get();
  const newActivityData = newActivitySnapshot.data();
  res.json(newActivityData);
}

export default withError(withAuth(withMethod(objHandler)));
