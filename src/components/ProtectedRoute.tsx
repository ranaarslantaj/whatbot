"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'owner' | 'agent')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role && !allowedRoles.includes(role)) {
        router.push("/"); // Redirect to portal if role not allowed
      }
    }
  }, [user, role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--dark)',
        color: 'var(--primary)'
      }}>
        <div className="loader">Loading WhatBot...</div>
      </div>
    );
  }

  return user && role && allowedRoles.includes(role) ? <>{children}</> : null;
};
