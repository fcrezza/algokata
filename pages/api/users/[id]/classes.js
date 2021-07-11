import admin from "utils/firebase-admin";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  GET: getHandler,
  POST: postHandler
};

async function getHandler(req, res) {
  const {id: userId} = req.query;

  if (req.authenticatedUser.user_id !== userId) {
    throw new HTTPForbiddenError("Operasi tidak diizinkan");
  }

  let userClassesSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .get();
  const userClassData = userClassesSnapshot.docs.map(c => c.data());
  res.json(userClassData);
}

async function postHandler(req, res) {
  try {
    const {classCode} = req.body;
    const userRef = admin
      .firestore()
      .collection("users")
      .doc(req.authenticatedUser.user_id);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data();

    if (userData.role !== "student") {
      throw new HTTPForbiddenError(
        "Operasi memerlukan identitas sebagai siswa"
      );
    }

    const classRef = admin.firestore().collection("classes").doc(classCode);
    const classSnapshot = await classRef.get();

    if (!classSnapshot.exists) {
      throw new HTTPNotFoundError("Kelas tidak ditemukan");
    }

    const classData = classSnapshot.data();
    const userClassRef = userRef.collection("classes").doc(classData.id);
    const newStudentRef = classRef.collection("students").doc(userData.id);
    const joinedAt = new Date().toISOString();

    await admin.firestore().runTransaction(async t => {
      t.create(newStudentRef, {
        id: userData.id,
        fullname: userData.fullname,
        avatar: userData.avatar,
        joinedAt
      });

      t.create(userClassRef, {
        id: classData.id,
        name: classData.name,
        description: classData.description,
        teacher: {
          id: classData.teacher.id,
          fullname: classData.teacher.fullname,
          avatar: classData.teacher.avatar
        },
        joinedAt
      });
    });

    res.json(classData);
  } catch (error) {
    if (error.code === 6) {
      throw new HTTPForbiddenError("Kamu sudah bergabung ke kelas ini");
    }

    throw error;
  }
}

export default withError(withAuth(withMethod(objHandler)));
