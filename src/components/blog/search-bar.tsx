"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { CategoryResponse } from "@/types/api"

interface SearchBarProps {
  onSearch: (params: SearchParams) => void
  topics: CategoryResponse[]
}

export interface SearchParams {
  query: string
  minRating?: number
  topics?: string[]
}

export function SearchBar({ onSearch, topics }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    minRating: 0,
    topics: [],
  })
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const debouncedSearch = useMemo(
    () => debounce(onSearch, 200),
    [onSearch]
  )

  useEffect(() => {
    debouncedSearch(searchParams)
  }, [searchParams, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, query: e.target.value }))
  }

  const handleTopicToggle = (topicId: number) => {
    const idStr = String(topicId)
    setSearchParams(prev => {
      const newTopics = prev.topics?.includes(idStr)
        ? prev.topics.filter(id => id !== idStr)
        : [...(prev.topics || []), idStr]
      return { ...prev, topics: newTopics }
    })
  }

  const clearFilters = () => {
    setSearchParams(prev => ({
      query: prev.query,
      minRating: 0,
      topics: [],
    }))
  }

  const applyFilters = () => {
    onSearch(searchParams)
    setIsAdvancedOpen(false)
  }

  const hasActiveFilters =
    (searchParams.minRating || 0) > 0 || (searchParams.topics?.length || 0) > 0

  return (
    <div className="w-full space-y-2">
      <div className="flex w-full items-center space-x-2">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm bài viết..."
            className="w-full pl-8"
            value={searchParams.query}
            onChange={handleInputChange}
          />
        </div>

        {/* Advanced filter button */}
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="icon"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Tìm theo danh mục</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4 mr-1" /> Làm mới
                  </Button>
                )}
              </div>

              {/* Topics filter */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Danh mục</h5>
                <div className="flex flex-wrap gap-2">
                  {topics.map(topic => {
                    const isSelected = searchParams.topics?.includes(
                      String(topic.id)
                    )
                    return (
                      <Badge
                        key={topic.id}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTopicToggle(topic.id)}
                      >
                        {topic.cname}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <Button className="w-full" onClick={applyFilters}>
                Áp dụng
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchParams.topics?.map(topicId => {
            const topic = topics.find(t => String(t.id) === topicId)
            if (!topic) return null
            return (
              <Badge
                key={topicId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {topic.cdesc}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => handleTopicToggle(topic.id)}
                />
              </Badge>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

/* --- Debounce helper --- */
function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}
