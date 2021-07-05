import {
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPUnauthorizedError
} from "utils/errors";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;

    case "POST":
      await postHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function getHandler(req, res) {
  try {
    const {id: idClass, type, order} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const userClassRef = admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .collection("classes")
      .doc(idClass);
    const cls = await userClassRef.get();
    let activites;

    if (!cls.exists) {
      const error = new HTTPNotFoundError("Kelas tidak ditemukan");
      return res.status(error.code).json({
        ...error,
        message: error.message
      });
    }

    if (type) {
      activites = await admin
        .firestore()
        .collection("classes")
        .doc(idClass)
        .collection("activities")
        .where("type", "==", type)
        .orderBy("createdAt", order)
        .get();
    } else {
      activites = await admin
        .firestore()
        .collection("classes")
        .doc(idClass)
        .collection("activities")
        .orderBy("createdAt", order)
        .get();
    }

    activites = activites.docs.map(a => a.data());

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(activites);
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
    const {id: idClass} = req.query;
    const {title, description, message, type} = req.body;
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

    const newDocRef = admin
      .firestore()
      .collection("classes")
      .doc(idClass)
      .collection("activities")
      .doc();

    if (type === "announcement") {
      newDocRef.set({
        id: newDocRef.id,
        title,
        message,
        type,
        createdAt: new Date().toISOString()
      });
    } else if (type === "task") {
      newDocRef.set({
        id: newDocRef.id,
        title,
        description,
        type,
        taskItems: [],
        createdAt: new Date().toISOString()
      });
    }

    const newDocData = await newDocRef.get();

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json(newDocData.data());
  } catch (error) {
    console.log(error);
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res.status(errorData.code).json({...errorData, message: errorData.message});
  }
}
