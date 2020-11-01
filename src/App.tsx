import React from "react";
import { Route, withRouter } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import { Provider } from "react-redux";

/* Theme variables */
import "./theme/variables.css";
import AppScreen from "./screens/AppScreen";
import LoginPage from "./pages/LoginPage";
import { store } from "./store/configureAppStore";
import RegisterPage from "./pages/RegisterPage";

const App: React.FC = () => (
  <IonApp>
    {/* <Provider store={store}> */}
    <IonReactRouter>
      <IonRouterOutlet>
        {/* <PrivateRoute path="/" component={AppScreen} exact /> */}
        <Route path="/login" component={LoginPage} exact />
        <Route path="/register" component={RegisterPage} exact />
      </IonRouterOutlet>
    </IonReactRouter>
    {/* </Provider> */}
  </IonApp>
);

export default App;
