import admin from "utils/firebase-admin";

export default async function handler(req, res) {
  try {
    const {id, email, fullname, avatar, isNewUser, role = null} = req.body;
    const {token} = req.cookies;
    const {user_id} = await admin.auth().verifyIdToken(token);

    if (user_id === id) {
      if (req.method === "POST") {
        if (isNewUser) {
          await admin.firestore().collection("users").doc(id).create({
            id: id,
            email,
            fullname,
            avatar,
            role,
            createdAt: new Date().toISOString()
          });
        } else {
          await admin.firestore().collection("users").doc(id).update({
            fullname,
            avatar
          });
        }

        let user = await admin.firestore().collection("users").doc(id).get();
        user = user.data();
        res.json(user);
      }

      if (req.method === "PUT") {
        await admin.firestore().collection("users").doc(id).update({
          fullname,
          avatar,
          role
        });

        res.json({
          message: "success update"
        });
      }
    } else {
      res
        .status(401)
        .json({code: 401, message: "Operasi membutuhkan autentikasi"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({code: 500, message: "something went wrong"});
  }
}
