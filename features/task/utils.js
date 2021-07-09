import useSWR from "swr";
import {useRouter} from "next/router";

import {useAuth} from "utils/auth";

export function useFetchTaskItems() {
  const router = useRouter();
  const taskItemsUrl = `/api/classes/${router.query.cid}/activities/${router.query.tid}/items`;
  const {data, error, mutate} = useSWR(taskItemsUrl);
  const isLoading = !Array.isArray(data) && typeof error === "undefined";
  const isError = !Array.isArray(data) && typeof error !== "undefined";

  return {data, error, mutate, isError, isLoading};
}

export function useFetchTaskAnswers() {
  const {user} = useAuth();
  const router = useRouter();
  const shouldFetch = user.role === "student";
  const taskAnswersUrl = `/api/classes/${router.query.cid}/activities/${router.query.tid}/answers?userId=${user.id}`;
  const {data, error, mutate} = useSWR(shouldFetch ? taskAnswersUrl : null);
  const isLoading =
    !Array.isArray(data) && typeof error === "undefined" && shouldFetch;
  const isError = !Array.isArray(data) && typeof error !== "undefined";

  return {data: data || [], error, mutate, isError, isLoading};
}
