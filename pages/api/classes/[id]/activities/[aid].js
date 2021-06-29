import {
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPUnauthorizedError
} from "utils/errors";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "DELETE":
      await deleteHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["DELETE", "POST"]);
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
