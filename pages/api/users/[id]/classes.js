import {HTTPForbiddenError, HTTPInternalServerError} from "utils/errors";
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
    const {id: userId} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);

    if (user.user_id !== userId) {
      const error = new HTTPForbiddenError("Operasi tidak diijinkan");
      return res.status(error.code).json(error);
    }

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    let clss = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .collection("classes")
      .get();
    clss = clss.docs.map(c => c.data());
    res.json(clss);
  } catch (error) {
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res.status(errorData.code).json(errorData);
  }
}
