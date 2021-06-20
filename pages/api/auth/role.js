import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {role} = req.body;
      const {idToken, refreshToken} = req.cookies;
      const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
      let userData = await admin
        .firestore()
        .collection("users")
        .doc(user.user_id)
        .get();
      userData = userData.data();

      if (userData.role !== null) {
        return res
          .status(403)
          .json({code: 403, message: "Role pengguna tidak dapat dirubah"});
      }

      await admin.firestore().collection("users").doc(user.user_id).update({
        role
      });

      if (newIdToken !== null) {
        sendCookie({res}, "idToken", newIdToken);
      }

      res.json({
        message: "success update"
      });
    } catch (error) {
      if (error.code === 401) {
        res.status(error.code).json({code: error.code, message: error.message});
      }

      console.log("Upss, something went wrong: ", error);
      res.status(500).json({code: 500, message: "something went wrong"});
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      error: {code: 405, message: `Method ${req.method} Not Allowed`}
    });
  }
}
