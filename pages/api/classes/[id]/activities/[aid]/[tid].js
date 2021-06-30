import {HTTPInternalServerError, HTTPNotFoundError} from "utils/errors";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["GET"]);
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

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(taskItem.data());
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
