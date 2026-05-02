// components/RouteGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserRole, UserRole } from "@/lib/roleManager";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push("/login_page");
          setLoading(false);
          return;
        }

        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = await getUserRole(user.uid);
          if (userRole && allowedRoles.includes(userRole)) {
            setAuthorized(true);
          } else {
            router.push("/unauthorized");
          }
        } else {
          setAuthorized(true);
        }
        
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}