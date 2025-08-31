"use client";
import React from "react";
import { AuthPageWrapper } from "@/components/auth/AuthPageWrapper";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push("/blogs");
  }

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
