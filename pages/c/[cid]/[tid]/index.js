import Task from "features/task";
import {withProtectedRoute} from "utils/routes";

const TaskPage = withProtectedRoute(() => <Task />);

export default TaskPage;
