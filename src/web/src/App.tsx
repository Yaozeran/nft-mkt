/* Copyright (c) 2026 Yao Zeran
 * 
 * The app file. */


import { RouterProvider } from 'react-router-dom'

import router from './routes'

import './App.css'


function App() {
  return (
    <RouterProvider router={router} />
  )
}


export default App
