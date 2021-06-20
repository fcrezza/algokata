import {sendCookie} from "utils/server-helpers";

export default function handler(req, res) {
  if (req.method === "DELETE") {
    sendCookie({res}, "idToken", "", new Date(0));
    sendCookie({res}, "refreshToken", "", new Date(0));
    res.json({message: "Success logout"});
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).json({
      error: {code: 405, message: `Method ${req.method} Not Allowed`}
    });
  }
}
