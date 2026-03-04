"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken, parseJwt, clearAuthStorage } from "@/lib/authStorage";
import { roleToPath } from "@/lib/roleMap";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[]; // role_name list (ex: ["Active Employee"])
};

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    // no tokens at all => force login
    if (!access && !refresh) {
      clearAuthStorage();
      router.replace("/login");
      return;
    }

    // if access exists, validate role_name and route
    if (access) {
      const decoded = parseJwt(access);
      const roleName = decoded?.role_name as string | undefined;

      // token broken => login
      if (!roleName) {
        clearAuthStorage();
        router.replace("/login");
        return;
      }

      // role check (optional)
      if (allowedRoles && !allowedRoles.includes(roleName)) {
        // send them to their correct dashboard
        router.replace(roleToPath(roleName));
        return;
      }

      setReady(true);
      return;
    }

    // If access is missing but refresh exists, allow page to render
    // NOTE: the first API call using authFetch will refresh automatically.
    setReady(true);
  }, [router, allowedRoles]);

  if (!ready) return null; // or a spinner

  return <>{children}</>;
}