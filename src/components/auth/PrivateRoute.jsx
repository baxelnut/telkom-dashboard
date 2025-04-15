import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Loading from "../utils/Loading";
import Error from "../utils/Error";

export default function PrivateRoute({ component: Component, ...rest }) {
  const [user, loading, error] = useAuthState(auth);

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Redirect to="/signin" />
      }
    />
  );
}
