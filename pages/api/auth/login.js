import admin from "utils/firebase-admin";
import {sendCookie} from "utils/server-helpers";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {isNewUser, idToken, refreshToken} = req.body;
      const {user_id, name, picture, email} = await admin
        .auth()
        .verifyIdToken(idToken);

      if (isNewUser) {
        await admin.firestore().collection("users").doc(user_id).create({
          id: user_id,
          email,
          fullname: name,
          avatar: picture,
          role: null,
          createdAt: new Date().toISOString()
        });
      }

      const user = await admin
        .firestore()
        .collection("users")
        .doc(user_id)
        .get();
      sendCookie({res}, "idToken", idToken);
      sendCookie({res}, "refreshToken", refreshToken);
      res.json(user.data());
    } catch (error) {
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
