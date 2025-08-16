"use client";
import React from "react";
import { AuthPageWrapper } from "@/components/auth/AuthPageWrapper";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
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
