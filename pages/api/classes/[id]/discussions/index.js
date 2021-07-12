import admin from "utils/firebase-admin";
import {HTTPNotFoundError} from "utils/errors";
import {withAuth, withError, withMethod} from "utils/server-helpers";

const handlerObj = {
  GET: getHandler,
  POST: postHandler
};

/*
TODO: - Implement full search feature
      - Implement pagination
      - implement "order by" feature
*/
async function getHandler(req, res) {
  // Temporary disable lint, this should be deleted when implement full search feature
  // eslint-disable-next-line
  const {id: classId, taskItemId = "", q} = req.query;
  const userClassSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(classId)
    .get();

  if (!userClassSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  let classDiscussionsSnapshot;
  const classDiscussionsRef = admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .orderBy("createdAt", "desc");

  if (taskItemId.length > 0) {
    classDiscussionsSnapshot = await classDiscussionsRef
      .where("taskItem.id", "==", taskItemId)
      .get();
  } else {
    classDiscussionsSnapshot = await classDiscussionsRef.get();
  }

  const classDiscussionsData = classDiscussionsSnapshot.docs.map(d => d.data());
  res.json(classDiscussionsData);
}

async function postHandler(req, res) {
  const {title, description, taskItemId, taskId} = req.body;
  const {id: classId} = req.query;
  const userClassSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(classId)
    .get();

  if (!userClassSnapshot.exists) {
    throw new HTTPNotFoundError("Kelas tidak ditemukan");
  }

  const taskItemsSnapshot = await admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("activities")
    .doc(taskId)
    .collection("taskItems")
    .doc(taskItemId)
    .get();

  if (!taskItemsSnapshot.exists) {
    throw new HTTPNotFoundError("Item tugas tidak ditemukan");
  }

  const userSnapshot = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .get();
  const userData = userSnapshot.data();
  const taskItemData = taskItemsSnapshot.data();
  const newDiscussionRef = admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .doc();
  await newDiscussionRef.set({
    id: newDiscussionRef.id,
    title,
    description,
    repliesCount: 0,
    author: {
      id: userData.id,
      fullname: userData.fullname,
      avatar: userData.avatar
    },
    taskItem: {
      id: taskItemData.id,
      title: taskItemData.title
    },
    createdAt: new Date().toISOString()
  });
  const newDiscussionSnapshot = await newDiscussionRef.get();
  const newDiscussionData = newDiscussionSnapshot.data();
  res.json(newDiscussionData);
}

export default withError(withAuth(withMethod(handlerObj)));
