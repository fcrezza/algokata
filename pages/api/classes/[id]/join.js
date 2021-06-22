import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const {id: idClass} = req.query;
      const {idToken, refreshToken} = req.cookies;
      const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
      const userRef = admin.firestore().collection("users").doc(user.user_id);
      const userData = (await userRef.get()).data();

      if (userData.role !== "student") {
        return res.status(403).json({
          error: {
            code: 403,
            message: "Operasi memerlukan identitas sebagai siswa"
          }
        });
      }

      const classRef = admin.firestore().collection("classes").doc(idClass);
      const classData = (await classRef.get()).data();

      if (!classData) {
        return res.status(404).json({
          error: {
            code: 404,
            message: "Kelas tidak ditemukan"
          }
        });
      }

      const userClassRef = userRef.collection("classes").doc(classData.id);
      const newStudentRef = classRef.collection("students").doc(userData.id);
      const joinedAt = new Date().toISOString();

      await admin.firestore().runTransaction(async t => {
        t.create(newStudentRef, {
          id: userData.id,
          fullname: userData.fullname,
          avatar: userData.avatar,
          joinedAt
        });

        t.create(userClassRef, {
          id: classData.id,
          name: classData.name,
          description: classData.description,
          teacher: {
            id: classData.teacher.id,
            fullname: classData.teacher.fullname,
            avatar: classData.teacher.avatar
          },
          joinedAt
        });
      });

      if (newIdToken !== null) {
        sendCookie({res}, "idToken", newIdToken);
      }

      res.json(classData);
    } catch (error) {
      if (error.code === 6) {
        return res.status(403).json({
          error: {code: 403, message: "Kamu sudah bergabung kelas ini"}
        });
      }

      if (error.code === 5) {
        return res.status(404).json({
          error: {code: 404, message: "Kelas tidak ditemukan"}
        });
      }
      res
        .status(500)
        .json({error: {code: 500, message: "Upss, gagal melakukan operasi"}});
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({
      error: {code: 405, message: `Method ${req.method} Not Allowed`}
    });
  }
}
