import {useRouter} from "next/router";

import {useAuth} from "utils/auth";

export const withProtectedRoute = WrappedComponent => () => {
  const {isAuth, user} = useAuth();
  const router = useRouter();

  if (!isAuth) {
    router.replace("/");
    return null;
  }

  if (isAuth && user.role === null && router.pathname !== "/auth") {
    router.replace("/auth");
    return null;
  }

  if (isAuth && user.role !== null && router.pathname === "/auth") {
    router.replace("/home");
    return null;
  }

  return <WrappedComponent />;
};

// export function UnProtectedRoute({children}) {
//   const {isAuth} = useAuth();
//   const router = useRouter();

//   if (isAuth) {
//     router.replace("/home");
//     return null;
//   }

//   return children;
// }
