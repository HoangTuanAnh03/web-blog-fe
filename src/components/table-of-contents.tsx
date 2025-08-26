"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>
}

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Header height to offset scroll position
  const HEADER_OFFSET = 80

  useEffect(() => {
    if (!contentRef.current) return

    // Get all headings from the content
    const elements = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6")

    const headingElements = Array.from(elements).map((element) => {
      // Create an id if not already set
      if (!element.id) {
        const id =
            element.textContent?.toLowerCase().replace(/\s+/g, "-") ||
            `heading-${Math.random().toString(36).substr(2, 9)}`
        element.id = id
      }

      return {
        id: element.id,
        text: element.textContent || "",
        level: Number.parseInt(element.tagName.substring(1)),
      }
    })

    setHeadings(headingElements)

    // Clean up previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Set up intersection observer to highlight active heading
    const observer = new IntersectionObserver(
        (entries) => {
          // Get all entries that are currently visible
          const visibleEntries = entries.filter((entry) => entry.isIntersecting)

          if (visibleEntries.length === 0) return

          // Find the first visible heading
          const visibleIds = visibleEntries.map((entry) => entry.target.id)

          // Find the first heading in our headings array that is visible
          // This ensures we maintain the document order
          const firstVisibleHeading = headingElements.find((heading) => visibleIds.includes(heading.id))

          if (firstVisibleHeading) {
            setActiveId(firstVisibleHeading.id)
          }
        },
        {
          rootMargin: `-${HEADER_OFFSET}px 0px -80% 0px`,
          threshold: 0.1,
        },
    )

    observerRef.current = observer
    elements.forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [contentRef])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    const element = document.getElementById(id)
    if (element) {
      // Scroll to element with smooth behavior
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
        behavior: "smooth",
      })

      // Update active ID
      setActiveId(id)
    }
  }

  if (headings.length === 0) {
    return null
  }

  // Calculate indentation based on heading level
  const getIndentation = (level: number) => {
    // Start with level 1 (h1) at 0 indentation
    const baseLevel = Math.min(...headings.map((h) => h.level))
    const indentLevel = level - baseLevel
    return `pl-${indentLevel * 4}`
  }

  return (
      <div className="space-y-2">
        <h4 className="font-medium">Mục Lục</h4>
        <nav className="space-y-1">
          {headings.map((heading) => (
              <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={cn(
                      "block text-sm transition-colors hover:text-foreground",
                      activeId === heading.id ? "font-medium text-foreground" : "text-muted-foreground",
                      getIndentation(heading.level),
                  )}
                  onClick={(e) => handleClick(e, heading.id)}
              >
                {heading.text}
              </a>
          ))}
        </nav>
      </div>
  )
}
