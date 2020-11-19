import { lazy } from 'react'
import locales from './locales'
import routes from './routes'
import getMenuItems from './menuItems'
import themes from './themes'
import parseLanguages from 'base-shell/lib/utils/locale'
import grants from './grants'
import Loading from 'material-ui-shell/lib/components/Loading/Loading'
import getDefaultRoutes from './getDefaultRoutes'
import { defaultUserData, isGranted } from 'rmw-shell/lib/utils/auth'

// google api key disabled
// prod and dev are the same,
// this is a simple app for personal learning
const config = {
  firebase: {
    prod: {
      initConfig: {
        apiKey: "AIzaSyBUB4oTsYYS_3YxNAzKGsnfz2dLHgVZDFE",
        authDomain: "cooking-app-dli.firebaseapp.com",
        databaseURL: "https://cooking-app-dli.firebaseio.com",
        projectId: "cooking-app-dli",
        storageBucket: "cooking-app-dli.appspot.com",
        messagingSenderId: "918741427146",
        appId: "1:918741427146:web:99b55048968b10f5006533",
        measurementId: "G-L36L58D0H2"
      },
      messaging: {
        publicVapidKey:
          'BEthk1-Qmoh9opZbi1AUZpxANTu6djVRDph4MLpyO2Qk6Dglm1Sa8Yt_pYi4EhYi3Tj-xgLqUktlbNuP_RP6gto',
      },
    },
    dev: {
      initConfig: {
        apiKey: "AIzaSyBUB4oTsYYS_3YxNAzKGsnfz2dLHgVZDFE",
        authDomain: "cooking-app-dli.firebaseapp.com",
        databaseURL: "https://cooking-app-dli.firebaseio.com",
        projectId: "cooking-app-dli",
        storageBucket: "cooking-app-dli.appspot.com",
        messagingSenderId: "918741427146",
        appId: "1:918741427146:web:99b55048968b10f5006533",
        measurementId: "G-L36L58D0H2"
      },
      messaging: {
        publicVapidKey:
          'BGddXH_O6qLmcingsSJx-R3hC8U9yUr2mW4ko63fF__e50WvfRcBfZu_JyBzLI35DNUE5x_9CPBqe64BWniCxV0',
      },
    },
    firebaseuiProps: {
      signInOptions: [
        'google.com',
        'github.com',
        'password',
        'phone',
      ],
    },
  },
  googleMaps: {
    apiKey: 'AIzaSyByMSTTLt1Mf_4K1J9necAbw2NPDu2WD7g',
  },
  auth: {
    grants,
    redirectTo: '/dashboard',
    persistKey: 'base-shell:auth',
    signInURL: '/signin',
    onAuthStateChanged: async (user, auth, firebaseApp) => {
      if (user != null) {
        const grantsSnap = await firebaseApp
          .database()
          .ref(`user_grants/${user.uid}`)
          .once('value')

        const isAdminSnap = await firebaseApp
          .database()
          .ref(`admins/${user.uid}`)
          .once('value')

        firebaseApp
          .database()
          .ref(`user_grants/${user.uid}`)
          .on('value', (snap) => {
            auth.updateAuth({ grants: snap.val() })
          })

        firebaseApp
          .database()
          .ref(`admins/${user.uid}`)
          .on('value', (snap) => {
            auth.updateAuth({ isAdmin: !!snap.val() })
          })

        auth.updateAuth({
          ...defaultUserData(user),
          grants: grantsSnap.val(),
          isAdmin: !!isAdminSnap.val(),
          isGranted,
        })

        firebaseApp.database().ref(`users/${user.uid}`).update({
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
          providers: user.providerData,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
        })

        await firebaseApp
          .database()
          .ref(`user_chats/${user.uid}/public_chat`)
          .update({
            displayName: 'Public Chat',
            lastMessage: 'Group chat',
            path: `group_chat_messages/public_chat`,
          })
      } else {
        firebaseApp.database().ref().off()
        auth.setAuth(defaultUserData(user))
      }
    },
  },
  getDefaultRoutes,
  routes,
  locale: {
    locales,
    persistKey: 'base-shell:locale',
    defaultLocale: parseLanguages(['en', 'de', 'ru'], 'en'),
    onError: (e) => {
      //console.warn(e)

      return
    },
  },
  menu: {
    getMenuItems,
    MenuHeader: lazy(() =>
      import('material-ui-shell/lib/components/MenuHeader/MenuHeader')
    ),
  },
  theme: {
    themes,
    defaultThemeID: 'default',
    defaultType: 'light',
  },
  pages: {
    LandingPage: lazy(() => import('../pages/LandingPage')),
    PageNotFound: lazy(() => import('../pages/PageNotFound')),
  },
  components: {
    Menu: lazy(() =>
      import('rmw-shell/lib/containers/FirebaseMenu/FirebaseMenu')
    ),
    Loading,
  },

  containers: {
    AppContainer: lazy(() =>
      import('material-ui-shell/lib/containers/AppContainer/AppContainer')
    ),
    LayoutContainer: lazy(() =>
      import('rmw-shell/lib/containers/LayoutContainer/LayoutContainer')
    ),
  },
}

export default config
