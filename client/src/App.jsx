import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { fetchCurrentUser } from './store/authSlice'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  )
}
