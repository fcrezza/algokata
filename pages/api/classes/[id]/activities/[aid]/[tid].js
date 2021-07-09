import {
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError
} from "utils/errors";
import admin from "utils/firebase-admin";
import {batchWrite, sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;

    case "DELETE":
      await deleteHandler(req, res);
      break;

    case "PUT":
      await putHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function getHandler(req, res) {
  try {
    const {id: idClass, aid: activityId, tid: itemId} = req.query;
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

    let taskItem = await activityRef.collection("taskItems").doc(itemId).get();

    if (!taskItem.exists) {
      const error = new HTTPNotFoundError(
        "Item tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    taskItem = taskItem.data();

    const userAnswer = await activityRef
      .collection("studentAnswers")
      .doc(user.user_id)
      .collection("answers")
      .doc(taskItem.id)
      .get();

    if (userAnswer.exists) {
      taskItem.isDone = true;
    } else {
      taskItem.isDone = false;
    }

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(taskItem);
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

/*
 NOTE: - Delete operation doesn't delete user answer when user already answer it before
       - Delete operation doesn't delete discussion when discussion reference to it before
*/
async function deleteHandler(req, res) {
  try {
    const {id: idClass, aid: activityId, tid: itemId} = req.query;
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

    const userClassData = userClass.data();

    if (!userClassData.isTeacher) {
      const error = new HTTPForbiddenError("Operasi tidak diizinkan");
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

    const activityData = activity.data();
    const taskItemRef = activityRef.collection("taskItems").doc(itemId);
    const taskItem = await taskItemRef.get();

    if (!taskItem.exists) {
      const error = new HTTPNotFoundError(
        "Item tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const taskItemData = taskItem.data();
    const newListItems = activityData.listItems.filter(
      i => i.id !== taskItemData.id
    );

    await admin.firestore().runTransaction(async function (t) {
      t.delete(taskItemRef);
      t.update(activityRef, {
        taskItems: newListItems
      });
    });

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json({message: "Berhasil dihapus"});
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

/*
 NOTE: - Update operation change fields in taskItem doc.
       - If taskItem's title changed, update title field in taskItems field in task doc.
       - If taskItem's title changed, update title field in discussion docs, when discussion has reference to it.
         If there are any.
       - If taskItem's title changed, update title field in studentAnswer docs, when studentAnswer has reference to it.
         If there are any.
       - This function perform transaction and batch write operation, maybe we can handle the error if it happens?.
         I don't know :)
*/
async function putHandler(req, res) {
  try {
    const {id: idClass, aid: activityId, tid: itemId} = req.query;
    const {title, description, solutionCode, testCode} = req.query;
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

    const userClassData = userClass.data();

    if (!userClassData.isTeacher) {
      const error = new HTTPForbiddenError("Operasi tidak diizinkan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const classRef = admin.firestore().collection("classes").doc(idClass);
    const activityRef = classRef.collection("activities").doc(activityId);
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

    const activityData = activity.data();
    const taskItemRef = activityRef.collection("taskItems").doc(itemId);
    const taskItem = await taskItemRef.get();

    if (!taskItem.exists) {
      const error = new HTTPNotFoundError(
        "Item tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    const taskItemData = taskItem.data();
    let isTitleChange = false;
    let studentAnswersSnapshot;
    let discussionsSnapshot;

    const newListItems = activityData.listItems.map(function (i) {
      if (i.id === taskItemData.id && i.title !== title) {
        i.title = title;
        isTitleChange = true;
      }

      return i;
    });

    if (isTitleChange) {
      studentAnswersSnapshot = await admin
        .firestore()
        .collectionGroup("answers")
        .where("taskItem.id" === taskItemData.id)
        .get();
      discussionsSnapshot = await admin
        .firestore()
        .collectionGroup("discussions")
        .where("taskItem.id" === taskItemData.id)
        .get();
    }

    await admin.firestore().runTransaction(async function (t) {
      t.update(taskItemRef, {
        title,
        description,
        solutionCode,
        testCode
      });

      if (isTitleChange) {
        t.update(activityRef, {
          listItems: newListItems
        });
      }
    });

    if (isTitleChange) {
      await batchWrite(studentAnswersSnapshot, {
        title
      });
      await batchWrite(discussionsSnapshot, {
        title
      });
    }

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    const newTaskItem = await taskItemRef.get();
    res.json(newTaskItem.data());
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
