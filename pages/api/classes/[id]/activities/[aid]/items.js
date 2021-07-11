import admin from "utils/firebase-admin";
import {
  withAuth,
  withMethod,
  withError,
  batchWrite
} from "utils/server-helpers";
import {
  HTTPForbiddenError,
  HTTPNotFoundError,
  HTTPBadRequestError
} from "utils/errors";

const objHandler = {
  GET: getHandler,
  PUT: putHandler,
  POST: postHandler,
  DELETE: deleteHandler
};

async function getHandler(req, res) {
  const {id: idClass, aid: activityId, itemId = ""} = req.query;
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

  const activityRef = admin
    .firestore()
    .doc(`classes/${idClass}/activities/${activityId}`);
  const activitySnapshot = await activityRef.get();

  if (!activitySnapshot.exists) {
    throw new HTTPNotFoundError("Tugas tidak  ditemukan");
  }

  if (itemId.length > 0) {
    const taskItemSnapshot = await activityRef
      .collection("taskItems")
      .doc(itemId)
      .get();

    if (!taskItemSnapshot.exists) {
      throw new HTTPNotFoundError("Item tidak  ditemukan");
    }

    const taskItemData = taskItemSnapshot.data();
    return res.json(taskItemData);
  }

  const taskItemsSnapshot = await activityRef
    .collection("taskItems")
    .orderBy("order")
    .get();
  const taskItemsData = taskItemsSnapshot.docs.map(i => i.data());
  res.json(taskItemsData);
}

/*
 NOTE: - Delete operation doesn't delete user answer when user already answer it before
       - Delete operation doesn't delete discussion when discussion reference to it before
*/
async function deleteHandler(req, res) {
  const {id: idClass, aid: activityId, itemId} = req.query;
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

  const activityRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("activities")
    .doc(activityId);
  const activitySnapshot = await activityRef.get();

  if (!activitySnapshot.exists) {
    throw new HTTPNotFoundError("Aktivitas tidak ditemukan");
  }

  const activityData = activitySnapshot.data();
  const taskItemRef = activityRef.collection("taskItems").doc(itemId);
  const taskItemSnapshot = await taskItemRef.get();

  if (!taskItemSnapshot.exists) {
    throw new HTTPNotFoundError("Item tidak ditemukan");
  }

  const taskItemData = taskItemSnapshot.data();
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
}

// This handler used to create a task item
async function postHandler(req, res) {
  const {id: idClass, aid: activityId} = req.query;
  const {title, description, solutionCode, testCode} = req.body;
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
    throw new HTTPForbiddenError("Operasi tidak diijinkan");
  }

  const activityRef = admin
    .firestore()
    .collection("classes")
    .doc(idClass)
    .collection("activities")
    .doc(activityId);
  const activitySnapshot = await activityRef.get();

  if (!activitySnapshot.exists) {
    throw new HTTPNotFoundError("Item tidak  ditemukan tidak ditemukan");
  }

  const activityData = activitySnapshot.data();

  if (activityData.type !== "task") {
    throw new HTTPBadRequestError("Item bukan tipe task");
  }

  const currentLastTaskSnapshot = await activityRef
    .collection("taskItems")
    .orderBy("order", "desc")
    .limit(1)
    .get();
  let currentLastTaskOrder = 0;

  if (!currentLastTaskSnapshot.empty) {
    const lastTaskData = currentLastTaskSnapshot.docs[0].data();
    currentLastTaskOrder = lastTaskData.order;
  }

  const newTaskRef = activityRef.collection("taskItems").doc();
  await admin.firestore().runTransaction(async t => {
    t.update(activityRef, {
      taskItems: admin.firestore.FieldValue.arrayUnion({
        id: newTaskRef.id,
        title,
        order: currentLastTaskOrder + 1
      })
    });

    if (!currentLastTaskSnapshot.empty) {
      t.set(
        currentLastTaskSnapshot.docs[0].ref,
        {
          next: {
            id: newTaskRef.id,
            title
          }
        },
        {merge: true}
      );
    }

    t.set(newTaskRef, {
      id: newTaskRef.id,
      title,
      description,
      solutionCode,
      testCode,
      class: {
        id: userClassData.id,
        name: userClassData.name
      },
      task: {
        id: activityData.id,
        title: activityData.title
      },
      order: currentLastTaskOrder + 1,
      next: null,
      createdAt: new Date().toISOString()
    });
  });

  const newTaskSnapshot = await newTaskRef.get();
  const newTaskData = newTaskSnapshot.data();
  res.json(newTaskData);
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
  const {id: idClass, aid: activityId, itemId} = req.query;
  const {title, description, solutionCode, testCode} = req.body;
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

  const classRef = admin.firestore().collection("classes").doc(idClass);
  const activityRef = classRef.collection("activities").doc(activityId);
  const activitySnapshot = await activityRef.get();

  if (!activitySnapshot.exists) {
    throw new HTTPNotFoundError("Aktivitas tidak ditemukan");
  }

  const activityData = activitySnapshot.data();
  const taskItemRef = activityRef.collection("taskItems").doc(itemId);
  const taskItemSnapshot = await taskItemRef.get();

  if (!taskItemSnapshot.exists) {
    throw new HTTPNotFoundError("Item tidak ditemukan");
  }

  const taskItemData = taskItemSnapshot.data();
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

  const newTaskItemSnapshot = await taskItemRef.get();
  const newTaskItemData = newTaskItemSnapshot.data();
  res.json(newTaskItemData);
}

export default withError(withAuth(withMethod(objHandler)));
