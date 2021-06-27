import {
  HTTPForbiddenError,
  HTTPInternalServerError,
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
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function deleteHandler(req, res) {
  try {
    const {id: idClass, mid: idStudent} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userRef = admin.firestore().collection("users").doc(user.user_id);
    const clsRef = admin.firestore().collection("classes").doc(idClass);
    const userData = (await userRef.get()).data();

    if (userData.role !== "student") {
      const error = new HTTPForbiddenError(
        "Operasi memerlukan identitas sebagai siswa"
      );
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    if (user.user_id !== idStudent) {
      const error = new HTTPUnauthorizedError(
        "Operasi membutuhkan autentikasi"
      );
      return res.status(error.code).json({
        error: {
          ...error,
          message: error.message
        }
      });
    }

    const classSnapshot = await clsRef
      .collection("students")
      .doc(idStudent)
      .get();
    const userClassSnapshot = await userRef
      .collection("classes")
      .doc(idClass)
      .get();

    const batch = admin.firestore().batch();
    batch.delete(classSnapshot.ref);
    batch.delete(userClassSnapshot.ref);
    await batch.commit();

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    res.json({message: "Kamu telah keluar dari kelas"});
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
