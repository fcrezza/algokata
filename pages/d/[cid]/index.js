import Discussion from "features/discussion";
import {withProtectedRoute} from "utils/routes";

const DiscussionPage = withProtectedRoute(Discussion);

export default DiscussionPage;
