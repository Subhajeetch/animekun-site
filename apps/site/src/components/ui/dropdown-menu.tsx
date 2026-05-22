"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// --- Contexts for State Management ---

interface DropdownMenuContextProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  closeMenu: () => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextProps | null>(null)

interface DropdownMenuSubContextProps {
  isSubOpen: boolean
  setIsSubOpen: (open: boolean) => void
  subTriggerRef: React.RefObject<HTMLDivElement | null>
  subContentRef: React.RefObject<HTMLDivElement | null>
  openSub: () => void
  closeSub: () => void
}

const DropdownMenuSubContext = React.createContext<DropdownMenuSubContextProps | null>(null)

// --- Root Component ---

function DropdownMenu({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setIsOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const closeMenu = React.useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  // Inject beautiful, high-performance micro-animations directly into the document head
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const styleId = "custom-pure-dropdown-animations"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.innerHTML = `
        @keyframes customDropdownScaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pure-dropdown {
          animation: customDropdownScaleIn 140ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top left;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef, contentRef, closeMenu }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

// --- Portal ---

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === "undefined") return null
  return createPortal(children, document.body) // Use it directly here
}
// --- Trigger ---

function DropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used inside DropdownMenu")

  return (
    <button
      ref={(node) => {
        context.triggerRef.current = node
      }}
      type="button"
      aria-haspopup="menu"
      aria-expanded={context.isOpen}
      onClick={(e) => {
        e.stopPropagation()
        context.setIsOpen(!context.isOpen)
      }}
      className={cn("outline-hidden cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  )
}

// --- Content Container ---

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuContent must be used inside DropdownMenu")

  const { isOpen, setIsOpen, triggerRef, contentRef } = context

  React.useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        contentRef.current && !contentRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const calculateLayoutPosition = () => {
      if (!triggerRef.current || !contentRef.current) return
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()

      let top = triggerRect.bottom + window.scrollY + sideOffset
      let left = triggerRect.left + window.scrollX

      if (align === "center") {
        left = triggerRect.left + window.scrollX + (triggerRect.width - contentRect.width) / 2
      } else if (align === "end") {
        left = triggerRect.right + window.scrollX - contentRect.width
      }

      // Responsive screen boundary collision protection
      if (left < 8) left = 8
      if (left + contentRect.width > window.innerWidth - 48) {
        left = window.innerWidth - contentRect.width - 48
      }

      contentRef.current.style.top = `${top}px`
      contentRef.current.style.left = `${left}px`
    }

    // Defer alignment calculation past render cycle to obtain exact content boundaries
    const executionFrame = setTimeout(calculateLayoutPosition, 0)

    document.addEventListener("mousedown", handleOutsideClick)
    window.addEventListener("scroll", calculateLayoutPosition, true)
    window.addEventListener("resize", calculateLayoutPosition)

    return () => {
      clearTimeout(executionFrame)
      document.removeEventListener("mousedown", handleOutsideClick)
      window.removeEventListener("scroll", calculateLayoutPosition, true)
      window.removeEventListener("resize", calculateLayoutPosition)
    }
  }, [isOpen, align, sideOffset, triggerRef, contentRef, setIsOpen])

  if (!isOpen) return null

  return (
    <DropdownMenuPortal>
      <div
        ref={(node) => {
          contentRef.current = node
        }}
        style={{ position: "absolute", zIndex: 50 }}
        className={cn(
          "animate-pure-dropdown min-w-32 bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 focus:outline-hidden max-h-[85vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </DropdownMenuPortal>
  )
}

// --- List Items & Interactivity ---

function DropdownMenuItem({
  className,
  variant = "default",
  onClick,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive"
}) {
  const context = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      context?.closeMenu()
    }
  }

  return (
    <div
      role="menuitem"
      onClick={handleClick}
      className={cn(
        "group relative flex cursor-default items-center gap-1.5 px-1.5 py-1 text-sm outline-hidden select-none transition-colors duration-75",
        "hover:bg-accent hover:text-accent-foreground",
        variant === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onClick,
  ...props
}: React.ComponentProps<"div"> & {
  checked?: boolean
}) {
  const context = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      context?.closeMenu()
    }
  }

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none transition-colors duration-75 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      {checked && (
        <span className="absolute right-2 flex size-4 items-center justify-center pointer-events-none">
          <svg className="size-3.5 stroke-[2.5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </div>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  checked,
  onClick,
  ...props
}: React.ComponentProps<"div"> & {
  checked?: boolean
}) {
  const context = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      context?.closeMenu()
    }
  }

  return (
    <div
      role="menuitemradio"
      aria-checked={checked}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none transition-colors duration-75 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      {checked && (
        <span className="absolute right-2 flex size-4 items-center justify-center pointer-events-none">
          <svg className="size-3.5 stroke-[2.5]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </div>
  )
}

// --- Submenus (Nested Control Engine) ---

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  const [isSubOpen, setIsSubOpen] = React.useState(false)
  const subTriggerRef = React.useRef<HTMLDivElement | null>(null)
  const subContentRef = React.useRef<HTMLDivElement | null>(null)
  const gracePeriodTimer = React.useRef<NodeJS.Timeout | null>(null)

  const openSub = React.useCallback(() => {
    if (gracePeriodTimer.current) clearTimeout(gracePeriodTimer.current)
    setIsSubOpen(true)
  }, [])

  const closeSub = React.useCallback(() => {
    if (gracePeriodTimer.current) clearTimeout(gracePeriodTimer.current)
    gracePeriodTimer.current = setTimeout(() => {
      setIsSubOpen(false)
    }, 120) // Smooth visual bridge window allowing cross-pointer movement
  }, [])

  React.useEffect(() => {
    return () => {
      if (gracePeriodTimer.current) clearTimeout(gracePeriodTimer.current)
    }
  }, [])

  return (
    <DropdownMenuSubContext.Provider value={{ isSubOpen, setIsSubOpen, subTriggerRef, subContentRef, openSub, closeSub }}>
      <div onMouseLeave={closeSub} className="w-full">
        {children}
      </div>
    </DropdownMenuSubContext.Provider>
  )
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const subContext = React.useContext(DropdownMenuSubContext)
  if (!subContext) throw new Error("DropdownMenuSubTrigger must be used inside DropdownMenuSub")

  const { isSubOpen, subTriggerRef, openSub } = subContext

  return (
    <div
      ref={(node) => {
        subTriggerRef.current = node
      }}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={isSubOpen}
      onMouseEnter={openSub}
      onClick={(e) => {
        e.stopPropagation()
        openSub()
      }}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none transition-colors duration-75 hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent",
        isSubOpen && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      <svg className="ml-auto size-4 shrink-0 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  )
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const subContext = React.useContext(DropdownMenuSubContext)
  if (!subContext) throw new Error("DropdownMenuSubContent must be used inside DropdownMenuSub")

  const { isSubOpen, subTriggerRef, subContentRef, openSub, closeSub } = subContext

  React.useEffect(() => {
    if (!isSubOpen) return

    const handleSubPositioning = () => {
      if (!subTriggerRef.current || !subContentRef.current) return
      const triggerRect = subTriggerRef.current.getBoundingClientRect()
      const contentRect = subContentRef.current.getBoundingClientRect()

      let top = triggerRect.top + window.scrollY
      let left = triggerRect.right + window.scrollX + 2

      // Flip sub-menu panel direction backwards if overflowing offscreen right edge
      if (left + contentRect.width > window.innerWidth - 8) {
        left = triggerRect.left + window.scrollX - contentRect.width - 2
      }

      subContentRef.current.style.top = `${top}px`
      subContentRef.current.style.left = `${left}px`
    }

    const alignmentFrame = setTimeout(handleSubPositioning, 0)
    window.addEventListener("scroll", handleSubPositioning, true)
    window.addEventListener("resize", handleSubPositioning)

    return () => {
      clearTimeout(alignmentFrame)
      window.removeEventListener("scroll", handleSubPositioning, true)
      window.removeEventListener("resize", handleSubPositioning)
    }
  }, [isSubOpen, subTriggerRef, subContentRef])

  if (!isSubOpen) return null

  return (
    <DropdownMenuPortal>
      <div
        ref={(node) => {
          subContentRef.current = node
        }}
        onMouseEnter={openSub}
        onMouseLeave={closeSub}
        style={{ position: "absolute", zIndex: 51 }}
        className={cn(
          "animate-pure-dropdown min-w-[110px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 focus:outline-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </DropdownMenuPortal>
  )
}

// --- Layout Layout Groups & Formatting ---

function DropdownMenuRadioGroup({ children, ...props }: React.ComponentProps<"div">) {
  return <div role="group" {...props}>{children}</div>
}

function DropdownMenuGroup({ children, ...props }: React.ComponentProps<"div">) {
  return <div role="group" {...props}>{children}</div>
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground", className)} {...props} />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground opacity-60", className)} {...props} />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}