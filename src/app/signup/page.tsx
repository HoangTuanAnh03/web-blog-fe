"use client";

import React from "react";
import { AuthPageWrapper } from "@/components/auth/AuthPageWrapper";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthPageWrapper
      title="Đăng Ký"
      description="Nhập thông tin để tạo tài khoản mới"
      footer={null}
    >
      <SignupForm />
    </AuthPageWrapper>
  );
}
