import { Outlet } from "react-router-dom";
import Selections from "../components/Selections";

export default function AnalyticsLayout() {
  return (
    <div>
      <Selections />
      <Outlet />
    </div>
  );
}
