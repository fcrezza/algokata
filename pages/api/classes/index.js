import admin from "utils/firebase-admin";
import {HTTPForbiddenError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const objHandler = {
  POST: postHandler
};

async function postHandler(req, res) {
  const {className, classDescription} = req.body;
  let userRef = admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data();

  if (userData.role !== "teacher") {
    throw new HTTPForbiddenError(
      "Operasi memerlukan identitas sebagai pengajar"
    );
  }

  const createdAt = new Date().toISOString();
  const classesRef = admin.firestore().collection("classes").doc();
  const userClassRef = userRef.collection("classes").doc(classesRef.id);
  await admin.firestore().runTransaction(async t => {
    t.create(classesRef, {
      id: classesRef.id,
      name: className,
      description: classDescription,
      teacher: {
        id: userData.id,
        fullname: userData.fullname,
        avatar: userData.avatar
      },
      createdAt
    });

    t.create(userClassRef, {
      id: classesRef.id,
      name: className,
      description: classDescription,
      isTeacher: true,
      teacher: {
        id: userData.id,
        fullname: userData.fullname,
        avatar: userData.avatar
      },
      createdAt
    });
  });
  const newClassSnapshot = await classesRef.get();
  const newClassData = newClassSnapshot.data();
  res.json(newClassData);
}

export default withError(withAuth(withMethod(objHandler)));
