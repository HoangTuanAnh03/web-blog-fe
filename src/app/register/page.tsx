"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function VerifyRegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { verifyRegistration } = useAuth()
    const [isVerifying, setIsVerifying] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const verifyCode = async () => {
            try {
                const code = searchParams.get("code")
                if (!code) {
                    setIsSuccess(false)
                    setErrorMessage("Mã xác minh không hợp lệ hoặc đã hết hạn.")
                    setIsVerifying(false)
                    return
                }

                const success = await verifyRegistration(code)
                setIsSuccess(success)
                if (!success) {
                    setErrorMessage("Xác minh tài khoản thất bại. Mã xác minh không hợp lệ hoặc đã hết hạn.")
                }
            } catch (error) {
                console.error("Verification error:", error)
                setIsSuccess(false)
                setErrorMessage("Đã xảy ra lỗi khi xác minh tài khoản. Vui lòng thử lại sau.")
            } finally {
                setIsVerifying(false)
            }
        }

        verifyCode()
    }, [searchParams, verifyRegistration])

    const handleContinue = () => {
        router.push("/")
    }

    const handleRetry = () => {
        router.push("/signup")
    }

    return (
        <div className="container max-w-md mx-auto py-12 px-4">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Xác Minh Tài Khoản</CardTitle>
                    <CardDescription className="text-center">
                        {isVerifying
                            ? "Đang xác minh tài khoản của bạn..."
                            : isSuccess
                                ? "Tài khoản của bạn đã được xác minh thành công!"
                                : "Xác minh tài khoản thất bại"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    {isVerifying ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <p className="text-center text-muted-foreground">
                                Vui lòng đợi trong khi chúng tôi xác minh tài khoản của bạn...
                            </p>
                        </div>
                    ) : isSuccess ? (
                        <div className="flex flex-col items-center gap-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <p className="font-medium">Xác minh thành công!</p>
                                <p className="text-muted-foreground">
                                    Tài khoản của bạn đã được xác minh thành công. Bạn đã có thể đăng nhập và sử dụng tất cả các tính năng
                                    của nền tảng.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <XCircle className="h-16 w-16 text-red-500" />
                            <div className="text-center space-y-2">
                                <p className="font-medium">Xác minh thất bại</p>
                                <p className="text-muted-foreground">{errorMessage}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    {isVerifying ? null : isSuccess ? (
                        <Button onClick={handleContinue} className="w-full">
                            Tiếp tục đến trang chủ
                        </Button>
                    ) : (
                        <div className="flex flex-col w-full gap-2">
                            <Button onClick={handleRetry} variant="outline">
                                Thử đăng ký lại
                            </Button>
                            <Button onClick={handleContinue}>Về trang chủ</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
