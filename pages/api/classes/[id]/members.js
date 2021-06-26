import {HTTPInternalServerError} from "utils/errors";
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
    const {id: idClass} = req.query;
    const {idToken, refreshToken} = req.cookies;
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const classRef = admin.firestore().collection("classes").doc(idClass);
    const cls = await classRef.get();

    if (!cls.exists) {
      return res.json({});
    }

    const {teacher} = cls.data();
    let classStudents = await classRef.collection("students").get();
    let isInClass = teacher.id === user.user_id;
    classStudents = classStudents.docs.map(s => {
      const student = s.data();

      if (student.id === user.user_id) {
        isInClass = true;
      }

      return student;
    });

    if (newIdToken !== null) {
      sendCookie({res}, "idToken", newIdToken);
    }

    const responseData = isInClass ? {teacher, students: classStudents} : null;
    res.json(responseData);
  } catch (error) {
    console.log(error);
    const errorData = new HTTPInternalServerError(
      "Upsss ada kesalahan saat memproses request"
    );
    res.status(errorData.code).json({...errorData, message: errorData.message});
  }
}
