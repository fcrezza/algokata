import React from "react";
import axios from "axios";
import useSWR from "swr";
import {useErrorHandler} from "react-error-boundary";

import firebase from "utils/firebase-client";

const AuthContext = React.createContext();

export function AuthProvider({children}) {
  const {data: user, mutate, error} = useSWR("/api/auth/user");
  useErrorHandler(error);

  const googleLogin = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const {user, additionalUserInfo} = await firebase
      .auth()
      .signInWithPopup(provider);
    const idToken = await user.getIdToken();
    const {data: userData} = await axios.post("/api/auth/login", {
      isNewUser: additionalUserInfo.isNewUser,
      idToken,
      refreshToken: user.refreshToken
    });

    await mutate(userData, false);
    return userData;
  };

  const logout = async () => {
    await axios.delete("/api/auth/logout");
    await mutate({}, false);
  };

  const setRole = async role => {
    await axios.post("/api/auth/role", {role});
    await mutate({...user, role}, false);
  };

  const isAuth = user && Object.keys(user).length > 0;

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        user,
        googleLogin,
        setRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
