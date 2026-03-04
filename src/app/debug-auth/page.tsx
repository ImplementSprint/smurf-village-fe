"use client";

import { useEffect, useState } from "react";
import { getAccessToken, getRefreshToken, parseJwt } from "@/lib/authStorage";

export default function DebugAuthPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    const decoded = access ? parseJwt(access) : null;

    setInfo({
      access_exists: !!access,
      refresh_exists: !!refresh,
      decoded_access: decoded,
      access_preview: access ? access.slice(0, 30) + "..." : null,
      refresh_preview: refresh ? refresh.slice(0, 30) + "..." : null,
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug Auth</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}