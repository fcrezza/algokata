import {useRouter} from "next/router";

import ToCheck from "features/toCheck";
import Task from "features/toCheck/Task";
import UserAnswers from "features/toCheck/UserAnswers";
import {withProtectedRoute} from "utils/routes";

function ToCheckPage() {
  const router = useRouter();
  const [classId, taskId, userId] = router.query.ids;

  if (userId) {
    return <UserAnswers />;
  }

  if (taskId) {
    return <Task />;
  }

  if (classId) {
    return <ToCheck />;
  }
}

export default withProtectedRoute(ToCheckPage);
