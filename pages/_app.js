// pages/_app.js
import { SessionProvider } from 'next-auth/react'
import MainNav from '../components/MainNav'
import { Provider } from 'react-redux'
import { store } from '../store/store'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <MainNav />
        <Component {...pageProps} />
      </SessionProvider>
    </Provider>
  )
}

export default MyApp