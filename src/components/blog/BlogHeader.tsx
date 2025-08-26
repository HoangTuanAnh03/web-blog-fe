import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"

export function BlogHeader({ user }: { user: any }) {
  const currentDate = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="space-y-4">
      {/* Title section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Tạo Bài Viết Mới
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 font-semibold">
              {user.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium">{user.name}</p>
            <Badge variant="secondary" className="text-xs">
              Tác giả
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
