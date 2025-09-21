"use client";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Rocket, AlertTriangle } from "lucide-react";

export function CrawlConfirm({ onConfirm, pending }: { onConfirm: () => void; pending?: boolean; }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default" disabled={pending} className="rounded-full gap-2">
          <Rocket className="h-4 w-4" /> Bắt đầu tự động đăng
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500"/> Xác nhận khởi động</AlertDialogTitle>
          <AlertDialogDescription>
            Hệ thống sẽ crawl các link tác giả đã lưu và tự động đăng bài. Quá trình chạy nền — vui lòng chờ trong giây lát sau khi xác nhận.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Xác nhận</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
