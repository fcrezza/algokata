import {HTTPInternalServerError} from "utils/errors";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default function handler(req, res) {
  switch (req.method) {
    case "GET":
      getHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

export async function getHandler(req, res) {
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
