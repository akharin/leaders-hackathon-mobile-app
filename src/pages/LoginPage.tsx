import React, { useCallback, useState } from "react";
// import { bindActionCreators, Dispatch } from "redux";
// import { connect } from "react-redux";
import { Location } from "history";
// import { login } from "../actions/auth/login";
// import "./LoginPage.less";
// import { IState } from "../store/modules";
import history from "../utils/getHistory";
import useMount from "react-use/lib/useMount";
import IUser from "../interfaces/IUser";
import {
  IonButtons,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonToast,
  IonText,
  IonPage,
  IonContent,
} from "@ionic/react";

interface ILoginPageProps {
  location: Location<{ redirect: Location }>;
}

interface ILoginPageStateProps {
  isAuthorized: boolean;
}

interface ILoginPageDispatchProps {
  authorize(email: string, password: string): Promise<IUser>;
}

/**
 * Компонент формы ввода логина и пароля
 */
const LoginPage = (
  props: ILoginPageProps & ILoginPageStateProps & ILoginPageDispatchProps
) => {
  const { location, isAuthorized } = props;

  const [phone, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useMount(() => {
    if (isAuthorized) {
      history.push("/");
    }
  });

  const authorizeUser = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      await props.authorize(email, password);

      let redirect = { pathname: "/" };
      if (location.state && location.state.redirect) {
        const stateRedirect = { ...location.state.redirect };
        delete stateRedirect.key;
        if (
          stateRedirect.pathname !== "/login" &&
          stateRedirect.pathname !== "/logout"
        ) {
          redirect = stateRedirect;
        }
      }
      history.push(redirect);
    },
    [location]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start" />
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Телефон</IonLabel>
          <IonInput
            type="tel"
            onIonChange={(e) => {
              //@ts-ignore
              setEmail(e.detail.value);
            }}
            name="tel"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Пароль</IonLabel>
          <IonInput
            type="password"
            onIonChange={(e) => {
              //@ts-ignore
              setPassword(e.detail.value);
            }}
            name="password"
          />
        </IonItem>
        <div style={{ padding: 10, paddingTop: 20 }}>
          <IonButton
            expand="full"
            style={{ margin: 14 }}
            onClick={(e) => {
              if (!e.currentTarget) {
                return;
              }
              e.preventDefault();
              //   _doLogin(history);
            }}
          >
            Войти
          </IonButton>
          <IonButton
            expand="full"
            style={{ margin: 14 }}
            onClick={(e) => {
              e.preventDefault();
              history.push("/register");
            }}
          >
            Регистрация
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

// const mapStateToProps = (state: IState) =>
//   ({
//     isAuthorized: state.auth.isAuthorized,
//   } as ILoginPageStateProps);

// const mapDispatchToProps = (dispatch: Dispatch) =>
//   // @ts-ignore
//   ({
//     authorize: bindActionCreators(login, dispatch),
//   } as ILoginPageDispatchProps);

export default LoginPage;
