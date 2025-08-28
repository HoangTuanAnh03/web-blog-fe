"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadToNuuls } from "@/lib/uploadToImgur"; // 🔥 Import upload function

interface UserData {
  id: string;
  name: string;
  avatar: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // 🔥 Store selected file

  const getHeaders = useCallback(() => {
    const token = JSON.parse(
      localStorage.getItem("authState") || "{}"
    )?.accessToken;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://api.sportbooking.site/users/my-info", {
          headers: getHeaders(),
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        if (json.code === 200) {
          setUser(json.data);
        } else {
          throw new Error(json.message);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin",
          variant: "destructive",
        });
        router.push("/login");
      }
    };

    fetchUser();
  }, [getHeaders, toast, router]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const avatarUrl = await uploadToNuuls(file);
      
      setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
      
      toast({
        title: "Upload thành công",
        description: "Ảnh đại diện đã được tải lên",
      });
      
      console.log('🔥 Avatar uploaded successfully:', avatarUrl);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Lỗi upload",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
      
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleRemoveAvatar = () => {
    setUser((prev) => (prev ? { ...prev, avatar: null } : null));
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên không được để trống",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: user.name,
        dob: user.dob,
        gender: user.gender,
        ...(user.avatar && !user.avatar.startsWith('blob:') ? { avatar: user.avatar } : {})
      };

      console.log('🔥 Submitting with payload:', payload);

      const res = await fetch(
        `https://api.sportbooking.site/users/${user.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      const json = await res.json();
      if (json.code === 200) {
        const authState = JSON.parse(localStorage.getItem("authState") || "{}");
        authState.user = { ...authState.user, ...json.data };
        localStorage.setItem("authState", JSON.stringify(authState));

        toast({ title: "Thành công", description: "Đã cập nhật thông tin" });
        
        setTimeout(() => {
          window.location.href = "/users/my-info";
        }, 1500);
      } else {
        throw new Error(json.message);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Cập nhật thất bại",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chỉnh sửa hồ sơ</h1>
        <p className="text-muted-foreground mt-2">
          Cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
              <CardDescription>
                Chọn ảnh để tải lên (ảnh sẽ được lưu ngay lập tức)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={avatarPreview || user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              
              {avatarFile && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ Ảnh đã được tải lên thành công
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    Xóa ảnh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Section */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên hiển thị</Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên của bạn"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Ngày sinh</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={user.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Giới tính</Label>
                    <Select
                      value={user.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
