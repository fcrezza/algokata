import {sendCookie, withMethod} from "utils/server-helpers";

const objHandler = {
  DELETE: handler
};

function handler(req, res) {
  sendCookie({res}, "idToken", "", new Date(0));
  sendCookie({res}, "refreshToken", "", new Date(0));
  res.json({message: "Success logout"});
}

export default withMethod(objHandler);
