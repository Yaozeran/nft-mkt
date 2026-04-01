/* Copyright (c) 2026 Yao Zeran
 * 
 * The main file. */


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import './index.css'
import router from './routes'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
