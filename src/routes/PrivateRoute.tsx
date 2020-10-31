/* /src/routes/privateRoute.jsx */
import React, { useState } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import useAppDispatch from "../core/hooks/useAppDispatch";
import useAppSelector from "../core/hooks/useAppSelector";
import useAsync from "react-use/lib/useAsync";
import { checkAuth } from "../actions/auth";

// import { Auth } from "../services/AuthService";

// export const PrivateRoute = ({ component, ...rest } : any) => {

//     function renderFn(props: any) {
//         if (Auth.Instance.session.isAuthenticated) {
//             return React.createElement(component, props);
//         }
//         return <Redirect to="/login" />
//     }

//     return <Route {...rest} render={renderFn} />;
// };

/**
 * Обёртка для Route, которая проверяет авторизован ли пользователь
 */
const PrivateRoute = (props: RouteProps) => {
  const { component: Component, ...rest } = props;
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector((s) => s.auth.isAuthorized);
  // const isActivated = useAppSelector(s => s.profile.activated);
  const [checking, setChecking] = useState(true);

  useAsync(async () => {
    if (!isAuthorized) {
      // @ts-ignore
      await dispatch(checkAuth());
    }
    setChecking(false);
  }, []);

  return !checking && Component ? (
    <Route
      {...rest}
      render={(routeProps) =>
        isAuthorized ? (
          <Component {...routeProps} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { redirect: routeProps.location },
            }}
          />
        )
      }
    />
  ) : null;
};

export default PrivateRoute;
