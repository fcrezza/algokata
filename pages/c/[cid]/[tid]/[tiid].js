import TaskItem from "features/taskItem";
import {withProtectedRoute} from "utils/routes";

const TaskItemPage = withProtectedRoute(() => <TaskItem />);

export default TaskItemPage;
