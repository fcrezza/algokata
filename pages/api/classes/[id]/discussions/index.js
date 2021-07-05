import admin from "utils/firebase-admin";
import {HTTPNotFoundError} from "utils/errors";
import {withAuth, withMethod} from "utils/server-helpers";

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
  const userClassRef = admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(classId);
  const cls = await userClassRef.get();
  let classDiscussions;

  if (!cls.exists) {
    const error = new HTTPNotFoundError("Kelas tidak ditemukan");
    return res.status(error.code).json({
      ...error,
      message: error.message
    });
  }

  const classDiscussionsRef = admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("discussions")
    .orderBy("createdAt", "desc");

  if (taskItemId.length > 0) {
    classDiscussions = await classDiscussionsRef
      .where("taskItem.id", "==", taskItemId)
      .get();
  } else {
    classDiscussions = await classDiscussionsRef.get();
  }

  const classDiscussionsData = classDiscussions.docs.map(d => d.data());
  res.json(classDiscussionsData);
}

async function postHandler(req, res) {
  const {title, description, taskItemId, taskId} = req.body;
  const {id: classId} = req.query;
  const userClassRef = admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .collection("classes")
    .doc(classId);
  const cls = await userClassRef.get();

  if (!cls.exists) {
    const error = new HTTPNotFoundError("Kelas tidak ditemukan");
    return res.status(error.code).json({
      ...error,
      message: error.message
    });
  }

  const taskItem = await admin
    .firestore()
    .collection("classes")
    .doc(classId)
    .collection("activities")
    .doc(taskId)
    .collection("taskItems")
    .doc(taskItemId)
    .get();

  if (!taskItem.exists) {
    const error = new HTTPNotFoundError("Item tidak ditemukan");
    return res.status(error.code).json({
      ...error,
      message: error.message
    });
  }

  const user = await admin
    .firestore()
    .collection("users")
    .doc(req.authenticatedUser.user_id)
    .get();
  const userData = user.data();
  const taskItemData = taskItem.data();
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
  const newDiscussion = await newDiscussionRef.get();
  res.json(newDiscussion.data());
}

export default withAuth(withMethod(handlerObj));
