import admin from "utils/firebase-admin";
import {withAuth, withMethod, batchWrite} from "utils/server-helpers";
import {HTTPForbiddenError, HTTPNotFoundError} from "utils/errors";

const objHandler = {
  GET: getHandler,
  PUT: putHandler,
  DELETE: deleteHandler
};

async function getHandler(req, res) {
  const {id: idClass, aid: activityId, itemId = ""} = req.query;
  const userClass = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
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

  if (itemId.length > 0) {
    const taskItem = await activityRef
      .collection("taskItems")
      .doc(itemId)
      .get();

    if (!taskItem.exists) {
      const error = new HTTPNotFoundError(
        "Item tidak  ditemukan tidak ditemukan"
      );
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    return res.json(taskItem.data());
  }

  const taskItems = await activityRef
    .collection("taskItems")
    .orderBy("order")
    .get();
  const taskItemsData = taskItems.docs.map(i => i.data());
  res.json(taskItemsData);
}

/*
 NOTE: - Delete operation doesn't delete user answer when user already answer it before
       - Delete operation doesn't delete discussion when discussion reference to it before
*/
async function deleteHandler(req, res) {
  try {
    const {id: idClass, aid: activityId, itemId} = req.query;
    const userClass = await admin
      .firestore()
      .collection("users")
      .doc(req.authenticatedUser.user_id)
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
    const newTaskItems = activityData.taskItems.filter(
      i => i.id !== taskItemData.id
    );

    await admin.firestore().runTransaction(async function (t) {
      t.delete(taskItemRef);
      t.update(activityRef, {
        taskItems: newTaskItems
      });
    });

    res.json({message: "Berhasil dihapus"});
  } catch (err) {
    console.log(err);
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
    const {id: idClass, aid: activityId, itemId} = req.query;
    const {title, description, solutionCode, testCode} = req.body;
    const userClass = await admin
      .firestore()
      .collection("users")
      .doc(req.authenticatedUser.user_id)
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

    const newTaskItems = activityData.taskItems.map(function (i) {
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
        .where("taskItem.id", "==", taskItemData.id)
        .get();
      discussionsSnapshot = await admin
        .firestore()
        .collectionGroup("discussions")
        .where("taskItem.id", "==", taskItemData.id)
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
          taskItems: newTaskItems
        });
      }
    });

    if (isTitleChange) {
      await batchWrite(studentAnswersSnapshot, {
        taskItem: {
          title
        }
      });
      await batchWrite(discussionsSnapshot, {
        taskItem: {
          title
        }
      });
    }

    const newTaskItem = await taskItemRef.get();
    res.json(newTaskItem.data());
  } catch (err) {
    console.log(err);
    res.json({sadasd: "asdasd"});
  }
}

export default withAuth(withMethod(objHandler));
