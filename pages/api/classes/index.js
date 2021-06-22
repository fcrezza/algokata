import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      await postHandler(req, res);
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({
        error: {code: 405, message: `Method ${req.method} Not Allowed`}
      });
      break;
  }
}

async function postHandler(req, res) {
  try {
    const {className, classDescription} = req.body;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userRef = admin.firestore().collection("users").doc(user.user_id);
    const userData = (await userRef.get()).data();

    if (userData.role !== "teacher") {
      return res.status(403).json({
        error: {
          code: 403,
          message: "Operasi memerlukan identitas sebagai pengajar"
        }
      });
    }

    const createdAt = new Date().toISOString();
    const classesRef = admin.firestore().collection("classes").doc();
    const userClassRef = userRef.collection("classes").doc(classesRef.id);

    await admin.firestore().runTransaction(async t => {
      t.create(classesRef, {
        id: classesRef.id,
        name: className,
        description: classDescription,
        teacher: {
          id: userData.id,
          fullname: userData.fullname,
          avatar: userData.avatar
        },
        createdAt
      });

      t.create(userClassRef, {
        id: classesRef.id,
        name: className,
        description: classDescription,
        isTeacher: true,
        teacher: {
          id: userData.id,
          fullname: userData.fullname,
          avatar: userData.avatar
        },
        createdAt
      });
    });

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    const newCreatedClass = (await classesRef.get()).data();
    res.json(newCreatedClass);
  } catch (error) {
    console.log("something went wrong: ", error);
    res
      .status(500)
      .json({error: {code: 500, message: "Upss, gagal melakukan operasi"}});
  }
}
