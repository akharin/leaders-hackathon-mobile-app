import React, { useCallback, useState } from "react";
// import { bindActionCreators, Dispatch } from "redux";
// import { connect } from "react-redux";
import { Location } from "history";
// import { login } from "../actions/auth/login";
// import "./RegisterPage.less";
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
import { withRouter } from "react-router";

interface IRegisterPageProps {
  location: Location<{ redirect: Location }>;
}

interface IRegisterPageStateProps {
  isAuthorized: boolean;
}

interface IRegisterPageDispatchProps {
  authorize(email: string, password: string): Promise<IUser>;
}

/**
 * Компонент формы ввода логина и пароля
 */
const RegisterPage = (
  props: IRegisterPageProps &
    IRegisterPageStateProps &
    IRegisterPageDispatchProps
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
          stateRedirect.pathname !== "/register" &&
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
          <IonTitle>Регистрация</IonTitle>
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
        <IonItem>
          <IonLabel position="floating">Имя</IonLabel>
          <IonInput
            type="text"
            onIonChange={(e) => {
              //@ts-ignore
              setPassword(e.detail.value);
            }}
            name="text"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Фамилия</IonLabel>
          <IonInput
            type="text"
            onIonChange={(e) => {
              //@ts-ignore
              setPassword(e.detail.value);
            }}
            name="text"
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Отчество</IonLabel>
          <IonInput
            type="text"
            onIonChange={(e) => {
              //@ts-ignore
              setPassword(e.detail.value);
            }}
            name="text"
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
              history.push("/login");
            }}
          >
            Войти
          </IonButton>
          <IonButton
            expand="full"
            style={{ margin: 14 }}
            onClick={(e) => {
              e.preventDefault();
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
//   } as IRegisterPageStateProps);

// const mapDispatchToProps = (dispatch: Dispatch) =>
//   // @ts-ignore
//   ({
//     authorize: bindActionCreators(login, dispatch),
//   } as IRegisterPageDispatchProps);
//@ts-ignore
export default withRouter(RegisterPage);
