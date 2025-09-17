"use client";
import React, { useEffect } from "react";
import { AuthPageWrapper } from "@/components/auth/AuthPageWrapper";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated /*, isLoading */ } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/blogs");
    }
  }, [isAuthenticated, router]);
  
  if (isAuthenticated) return null;

  return (
    <AuthPageWrapper
      title="Đăng Nhập"
      description="Nhập thông tin đăng nhập của bạn để tiếp tục"
      footer={null}
    >
      <LoginForm />
    </AuthPageWrapper>
  );
}
