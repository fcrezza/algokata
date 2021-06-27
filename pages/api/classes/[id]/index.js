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
    case "GET":
      await getHandler(req, res);
      break;

    case "PUT":
      await putHandler(req, res);
      break;

    case "DELETE":
      await deleteHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function getHandler(req, res) {
  try {
    const {id: idClass} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const cls = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .collection("classes")
      .doc(idClass)
      .get();

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    if (!cls.exists) {
      return res.json({});
    }

    res.json(cls.data());
  } catch (error) {
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res.status(errorData.code).json({...errorData, message: errorData.message});
  }
}

async function putHandler(req, res) {
  try {
    const {className, classDescription} = req.body;
    const {id: idClass} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userRef = admin.firestore().collection("users");
    const clsRef = admin.firestore().collection("classes").doc(idClass);
    const userData = (await userRef.doc(user.user_id).get()).data();

    if (userData.role !== "teacher") {
      const error = new HTTPForbiddenError(
        "Operasi memerlukan identitas sebagai pengajar"
      );
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    const clsData = (await clsRef.get()).data();

    if (userData.id !== clsData.teacher.id) {
      const error = new HTTPUnauthorizedError("Operasi memerlukan autentikasi");
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    const updatedAt = new Date().toISOString();
    const clsTargetSnapshot = await admin
      .firestore()
      .collectionGroup("classes")
      .where("id", "==", idClass)
      .get();
    const taskItemsTargetSnapshot = await admin
      .firestore()
      .collectionGroup("taskItem")
      .where("class.id", "==", idClass)
      .get();

    if (clsTargetSnapshot.empty) {
      const error = new HTTPNotFoundError("Kelas tidak ditemukan");
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    if (!clsTargetSnapshot.empty) {
      await batchWrite(clsTargetSnapshot, {
        name: className,
        description: classDescription,
        updatedAt
      });
    }

    if (!taskItemsTargetSnapshot.empty) {
      await batchWrite(taskItemsTargetSnapshot, {
        class: {
          name: className,
          updatedAt
        }
      });
    }

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json({...clsData, name: className, description: classDescription});
  } catch (error) {
    console.log(error);
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res
      .status(errorData.code)
      .json({error: {...errorData, message: errorData.message}});
  }
}

async function deleteHandler(req, res) {
  try {
    const {id: idClass} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userRef = admin.firestore().collection("users");
    const clsRef = admin.firestore().collection("classes").doc(idClass);
    const userData = (await userRef.doc(user.user_id).get()).data();

    if (userData.role !== "teacher") {
      const error = new HTTPForbiddenError(
        "Operasi memerlukan identitas sebagai pengajar"
      );
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    const clsData = (await clsRef.get()).data();

    if (userData.id !== clsData.teacher.id) {
      const error = new HTTPUnauthorizedError("Operasi memerlukan autentikasi");
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }
  } catch (error) {
    console.log(error);
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res
      .status(errorData.code)
      .json({error: {...errorData, message: errorData.message}});
  }
}
