import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/Auth'
import { MembersProvider } from './context/Members'
import { PlansProvider } from './context/Plans'
import { ClassesProvider } from './context/Classes'
import { ProgressProvider } from './context/Progress'
import { OpsProvider } from './context/Ops'
import { PaymentsProvider } from './context/Payments'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><AuthProvider><PlansProvider><MembersProvider><PaymentsProvider><OpsProvider><ClassesProvider><ProgressProvider><App /></ProgressProvider></ClassesProvider></OpsProvider></PaymentsProvider></MembersProvider></PlansProvider></AuthProvider></BrowserRouter></React.StrictMode>
)
