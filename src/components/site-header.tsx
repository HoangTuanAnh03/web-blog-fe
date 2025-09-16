"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, PenSquare, Compass } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";

export function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const safeAvatar =
    typeof user?.avatar === "string" &&
    user.avatar &&
    user.avatar !== "null" &&
    user.avatar !== "string"
      ? user.avatar
      : "/placeholder.svg";

  const handleLogout = () => {
    try {
      localStorage.removeItem("authState");
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.reload();
    }
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  const linkClass = (href: string) =>
    cn(
      "relative inline-flex items-center rounded-md px-1.5 py-1 text-sm font-medium transition-colors",
      "text-foreground/90 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      isActive(href) && "text-foreground bg-primary/10",
      // underline bar tinh tế khi hover/active
      "after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:rounded-full after:bg-primary after:transition-all after:duration-200",
      isActive(href) ? "after:w-1/2" : "after:w-0 hover:after:w-1/2"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[9999] rounded-md bg-card px-3 py-2 text-sm shadow"
      >
        Bỏ qua đến nội dung chính
      </a>

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left*/}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Mở menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-80">
                <nav className="mt-4 grid gap-2 text-base">
                  <Link
                    href="/"
                    className="mb-3 flex items-center gap-3 text-xl font-black tracking-tight"
                    aria-label="Trang chủ Blog"
                  >
                    <BookIcon className="h-6 w-6 text-primary" />
                    <span className="text-foreground">Blog Platform</span>
                  </Link>

                  <Link
                    href="/blogs"
                    className="rounded-md px-2 py-2 hover:bg-accent"
                    aria-current={isActive("/blogs") ? "page" : undefined}
                  >
                    Khám Phá
                  </Link>

                  <Link
                    href="/users/my-info"
                    className="rounded-md px-2 py-2 hover:bg-accent"
                    aria-current={isActive("/users") ? "page" : undefined}
                  >
                    Hồ Sơ
                  </Link>

                  <div className="mt-3 border-t border-border pt-3">
                    {isAuthenticated ? (
                      <Link href="/blogs/new">
                        <Button className="w-full gap-2 rounded-full shadow-card">
                          <PenSquare className="h-4 w-4" />
                          Viết bài
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <Link href="/login" className="flex-1">
                          <Button
                            variant="ghost"
                            className="w-full hover:bg-accent font-medium"
                          >
                            Đăng Nhập
                          </Button>
                        </Link>
                        <Link href="/signup" className="flex-1">
                          <Button className="w-full rounded-full shadow-card font-medium">
                            Đăng Ký
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Brand */}
            <Link
              href="/"
              className="group flex items-center gap-2"
              aria-label="Trang chủ"
            >
              <BookIcon className="h-6 w-6 text-primary transition-transform group-hover:scale-105 group-hover:text-primary/80" />
              <span className="text-lg font-black tracking-tight text-foreground group-hover:text-foreground/90">
                Blog
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="ml-4 hidden items-center gap-2 md:flex">
              <Link
                href="/blogs"
                className={linkClass("/blogs")}
                aria-current={isActive("/blogs") ? "page" : undefined}
              >
                <Compass className="mr-1.5 h-4 w-4" />
                Khám Phá
              </Link>
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center">
                  <NotificationBell />
                </div>

                {/* Divider*/}
                <div className="hidden md:block h-6 w-px bg-border/80 mx-1" />

                {/* Mobile*/}
                <Link href="/blogs/new" className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="Viết bài"
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>
                </Link>
                {/* Desktop*/}
                <Link href="/blogs/new" className="hidden md:block">
                  <Button className="gap-2 rounded-full shadow-card focus-visible:ring-2 focus-visible:ring-primary/40">
                    <PenSquare className="h-4 w-4" />
                    Viết bài
                  </Button>
                </Link>

                {/* Divider*/}
                <div className="hidden md:block h-6 w-px bg-border/80 mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-label="Mở menu tài khoản"
                    >
                      <Avatar className="h-9 w-9 border border-border shadow-sm">
                        <AvatarImage
                          src={safeAvatar}
                          alt={user?.name || "User avatar"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user?.name
                            ? user.name.substring(0, 2).toUpperCase()
                            : "AT"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-semibold">
                      {user?.name || "Tài khoản của tôi"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/users/my-info" className="cursor-pointer">
                        <User className="mr-3 h-4 w-4" />
                        Hồ Sơ
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Đăng Xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Link href="/login">
                  <Button className="rounded-full font-medium shadow-card focus-visible:ring-2 focus-visible:ring-primary/40">
                    Đăng Nhập
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="rounded-full font-medium focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Đăng Ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </header>
  );
}

// Custom icons
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
