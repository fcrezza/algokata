import {
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPUnauthorizedError
} from "utils/errors";
import admin from "utils/firebase-admin";
import {batchWrite, sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "DELETE":
      await deleteHandler(req, res);
      break;

    case "POST":
      await postHandler(req, res);
      break;

    case "PUT":
      await putHandler(req, res);
      break;

    case "GET":
      await getHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["DELETE", "POST", "GET", "PUT"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function deleteHandler(req, res) {
  try {
    const {id: idClass, aid: activityId} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const userClassRef = admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .collection("classes")
      .doc(idClass);
    let cls = await userClassRef.get();

    if (!cls.exists) {
      const error = new HTTPNotFoundError("Kelas tidak ditemukan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    cls = cls.data();

    if (!cls.isTeacher) {
      const error = new HTTPUnauthorizedError(
        "Operasi membutuhkan autentikasi"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const activityRef = admin
      .firestore()
      .collection("classes")
      .doc(idClass)
      .collection("activities")
      .doc(activityId);
    const activity = await activityRef.get();

    if (!activity.exists) {
      const error = new HTTPNotFoundError("Aktivitas tidak ditemukan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    activityRef.delete();

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json({message: "Berhasil dihapus"});
  } catch (error) {
    console.log(error);
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res.status(errorData.code).json({...errorData, message: errorData.message});
  }
}

async function postHandler(req, res) {
  try {
    const {id: idClass, aid: activityId} = req.query;
    const {title, description, solutionCode, testCode} = req.body;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userClass = await admin
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

    userClass = userClass.data();

    if (!userClass.isTeacher) {
      const error = new HTTPForbiddenError("Operasi tidak diijinkan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const activityRef = admin
      .firestore()
      .doc(`classes/${idClass}/activities/${activityId}`);
    let activity = await activityRef.get();

    if (!activity.exists) {
      const error = new HTTPNotFoundError(
        "Aktivitas tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    activity = activity.data();

    if (activity.type !== "task") {
      const error = new HTTPNotFoundError("Aktivitas bukan tipe task");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const currentLastItem = await activityRef
      .collection("taskItems")
      .orderBy("order", "desc")
      .limit(1)
      .get();
    let currentLastItemOrder = 0;

    if (!currentLastItem.empty) {
      const lastItemData = currentLastItem.docs[0].data();
      currentLastItemOrder = lastItemData.order;
    }

    let newItem = activityRef.collection("taskItems").doc();
    await admin.firestore().runTransaction(async t => {
      t.update(activityRef, {
        taskItems: admin.firestore.FieldValue.arrayUnion({
          id: newItem.id,
          title,
          order: currentLastItemOrder + 1
        })
      });

      if (!currentLastItem.empty) {
        t.set(
          currentLastItem.docs[0].ref,
          {
            next: {
              id: newItem.id,
              title
            }
          },
          {merge: true}
        );
      }

      t.set(newItem, {
        id: newItem.id,
        title,
        description,
        solutionCode,
        testCode,
        class: {
          id: userClass.id,
          name: userClass.name
        },
        task: {
          id: activity.id,
          title: activity.title
        },
        order: currentLastItemOrder + 1,
        next: null,
        createdAt: new Date().toISOString()
      });
    });
    newItem = await newItem.get();

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(newItem.data());
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

async function getHandler(req, res) {
  try {
    const {id: idClass, aid: activityId} = req.query;
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

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(activity.data());
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

async function putHandler(req, res) {
  try {
    const {id: idClass, aid: activityId} = req.query;
    const {title, description} = req.body;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userClass = await admin
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

    userClass = userClass.data();

    if (!userClass.isTeacher) {
      const error = new HTTPForbiddenError("Operasi tidak diizinkan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const taskRef = admin
      .firestore()
      .collection("classes")
      .doc(idClass)
      .collection("activities")
      .doc(activityId);
    const task = await taskRef.get();

    if (!task.exists) {
      const error = new HTTPNotFoundError("Tugas tidak ditemukan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const taskItemsSnapshot = await taskRef.collection("taskItems").get();
    await taskRef.update({title, description});
    await batchWrite(taskItemsSnapshot, {task: {title}});

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    const newTask = await taskRef.get();
    res.json(newTask.data());
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
