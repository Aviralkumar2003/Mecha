import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import PredictionChart from "./components/PredictionChart";
import Layout from "./layouts/Layout";
import Home from "./components/Home";
import AnalyticsLayout from "./layouts/AnalyticsLayout";
import ClusterAnalysis from "./components/ClusterAnalysis";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home/>} />
      <Route path=":store" element={<AnalyticsLayout />}>
        <Route index element={<PredictionChart />} />
      </Route>
      <Route path="clusterAnalysis" element={<ClusterAnalysis/>} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
