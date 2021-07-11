import auth from "features/auth";
import {withProtectedRoute} from "utils/routes";

export default withProtectedRoute(auth);
