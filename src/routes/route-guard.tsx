import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "@/store/hooks";

const AUTH_PATH = "/auth";
const DASHBOARD_PATH = "/dashboard";

const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sessionReady = useAppSelector((state) => state.auth.sessionReady);
  const location = useLocation();

  if (!sessionReady) {
    return null;
  }

  if (!currentUser) {
    return <Navigate replace state={{ from: location }} to={AUTH_PATH} />;
  }

  return children;
};

const GuestOnly: React.FC<PropsWithChildren> = ({ children }) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sessionReady = useAppSelector((state) => state.auth.sessionReady);

  if (!sessionReady) {
    return null;
  }

  if (currentUser) {
    return <Navigate replace to={DASHBOARD_PATH} />;
  }

  return children;
};

export { GuestOnly, RequireAuth };
