"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";
import type { MediumLink } from "@/types/api";

function normalizeUrl(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  try {
    const has = /^https?:\/\//i.test(v);
    return new URL(has ? v : `https://${v}`).toString();
  } catch {
    return "";
  }
}

function coerceList(res: any): MediumLink[] {
  const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  console.log("coerceList", data);
  return data
    .map((item: any) => {
      if (typeof item === "string") return { url: item } as MediumLink;
      return {
        id: item?.id ?? item?._id,
        url: typeof item?.url === "string" ? item.url : String(item?.url ?? ""),
        createdAt: item?.createdAt,
      } as MediumLink;
    })
    .filter((x: MediumLink) => !!x.url);
}

export function useAutoPost() {
  const qc = useQueryClient();
  const { toast } = useToast?.() || { toast: (x: any) => console.log(x) };

  const listQ = useQuery({
    queryKey: ["medium-follow", "list"],
    queryFn: async () => coerceList(await apiService.listMediumFollowLinks()),
    staleTime: 0,
  });

  const addOne = useMutation({
    mutationFn: async (raw: string) => {
      const url = normalizeUrl(raw);
      if (!url) throw new Error("URL không hợp lệ");
      console.log("addOne", url);
      return apiService.addMediumFollowLink(url);
    },
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["medium-follow", "list"] });
      const msg: string | undefined =
        res?.message || res?.data?.message || (typeof res === "string" ? res : undefined);
      const ok = typeof msg === "string" && msg.toLowerCase().includes("Thêm thành công");
      toast({
        title: ok ? "Thành công" : "Thông báo",
        description: msg || "Thao tác đã hoàn tất.",
        variant: ok ? undefined : "default",
      });
    },
    onError: (e: any) => {
      toast({
        title: "Không thể thêm",
        description: "Hãy kiểm tra lại URL",
        variant: "destructive",
      });
    },
  });

  const removeOne = useMutation({
    mutationFn: async (url: string) => {
      return apiService.unfollowMediumLink(url);
    },
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["medium-follow", "list"] });
      const msg: string | undefined =
        res?.message || res?.data?.message || (typeof res === "string" ? res : undefined);
      const ok = typeof msg === "string" && msg.toLowerCase().includes("success");
      toast({
        title: ok ? "Đã xoá" : "Thông báo",
        description: msg || "Đã xử lý yêu cầu xoá.",
        variant: ok ? undefined : "default",
      });
    },
    onError: (e: any) => {
      toast({
        title: "Xoá thất bại",
        description: "Chúng tôi sẽ nhanh chóng khắc phục lỗi này.",
        variant: "destructive",
      });
    },
  });

  const triggerCrawl = useMutation({
    mutationFn: async (tokenOverride?: string) =>
      apiService.triggerMediumCrawl(tokenOverride),
    onSuccess: (res: any) => {
      const msg: string | undefined =
        res?.message || res?.data?.message || (typeof res === "string" ? res : undefined);
      const ok = typeof msg === "string" && msg.toLowerCase().includes("success");
      toast({
        title: ok ? "Đã khởi động" : "Thông báo",
        description: msg || "Vui lòng chờ trong giây lát để bài viết được đăng.",
        variant: ok ? undefined : "default",
      });
    },
    onError: (e: any) => {
      toast({
        title: "Không thể khởi động",
        description: e?.message || "Lỗi không xác định",
        variant: "destructive",
      });
    },
  });

  const isBusy = addOne.isPending || removeOne.isPending || triggerCrawl.isPending;

  return {
    links: listQ.data ?? [],
    listQ,
    addOne,        
    removeOne,   
    triggerCrawl, 
    isBusy,
  };
}
