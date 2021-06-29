import Cls from "features/cls";
import {withProtectedRoute} from "utils/routes";

const ClassPage = withProtectedRoute(() => <Cls />);

export default ClassPage;
