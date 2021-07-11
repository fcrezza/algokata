import admin from "utils/firebase-admin";
import {
  batchWrite,
  withAuth,
  withError,
  withMethod
} from "utils/server-helpers";
import {
  HTTPForbiddenError,
  HTTPNotFoundError,
  HTTPUnauthorizedError
} from "utils/errors";

const objHandler = {
  GET: getHandler,
  PUT: putHandler,
  DELETE: deleteHandler
};

async function getHandler(req, res) {
  const {id: idClass} = req.query;
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
  res.json(userClassData);
}

async function putHandler(req, res) {
  const {className, classDescription} = req.body;
  const {id: idClass} = req.query;
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
    throw new HTTPForbiddenError("Operasi tidak diizinkan");
  }

  const updatedAt = new Date().toISOString();
  const classesSnapshot = await admin
    .firestore()
    .collectionGroup("classes")
    .where("id", "==", userClassData.id)
    .get();
  const taskItemsSnapshot = await admin
    .firestore()
    .collectionGroup("taskItem")
    .where("class.id", "==", userClassData.id)
    .get();

  if (!classesSnapshot.empty) {
    await batchWrite(classesSnapshot, {
      name: className,
      description: classDescription,
      updatedAt
    });
  }

  if (!taskItemsSnapshot.empty) {
    await batchWrite(taskItemsSnapshot, {
      class: {
        name: className,
        updatedAt
      }
    });
  }

  const newUserClassSnapshot = await userClassSnapshot.ref.get();
  const newUserClassData = newUserClassSnapshot.data();
  res.json(newUserClassData);
}

async function deleteHandler(req, res) {
  const {id: idClass} = req.query;
  let userRef = admin.firestore().collection("users");
  const clsRef = admin.firestore().collection("classes").doc(idClass);
  const userData = (
    await userRef.doc(req.authenticatedUser.user_id).get()
  ).data();

  if (userData.role !== "teacher") {
    const error = new HTTPForbiddenError(
      "Operasi memerlukan identitas sebagai pengajar"
    );
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }

  const clsData = (await clsRef.get()).data();

  if (userData.id !== clsData.teacher.id) {
    const error = new HTTPUnauthorizedError("Operasi memerlukan autentikasi");
    return res.status(error.code).json({
      error: {
        ...error,
        message: error.message
      }
    });
  }
}

export default withError(withAuth(withMethod(objHandler)));
