"use client"

import * as React from "react"

/* ─── utils ──────────────────────────────────────────────── */

type ClassPrimitive = string | boolean | null | undefined
type ClassValue     = ClassPrimitive | ClassPrimitive[]

function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const v of inputs) {
    if (!v) continue
    if (typeof v === "string") { out.push(v); continue }
    if (Array.isArray(v)) {
      for (const inner of v) {
        if (inner && typeof inner === "string") out.push(inner)
      }
    }
  }
  return out.join(" ")
}

/* ─── Constants ──────────────────────────────────────────── */

const FADE_MS = 200

/* ─── Injected CSS ───────────────────────────────────────── */

const TABS_CSS = `
@keyframes _tabs-fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0);   }
}

[data-orientation="horizontal"]
  [data-slot="tabs-list"][data-variant="line"]
  [data-slot="tabs-trigger"]::after {
  content: "";
  position: absolute;
  bottom: -5px; left: 0; right: 0;
  height: 2px;
  background: currentColor;
  opacity: 0;
  transition: opacity 150ms ease;
}

[data-orientation="vertical"]
  [data-slot="tabs-list"][data-variant="line"]
  [data-slot="tabs-trigger"]::after {
  content: "";
  position: absolute;
  top: 0; bottom: 0;
  right: -4px;
  width: 2px;
  background: currentColor;
  opacity: 0;
  transition: opacity 150ms ease;
}

[data-slot="tabs-list"][data-variant="line"]
  [data-slot="tabs-trigger"][data-active]::after {
  opacity: 1;
}
`

let _tabsStyleInjected = false
function useInjectTabsStyles(): void {
  if (typeof window !== "undefined" && !_tabsStyleInjected) {
    _tabsStyleInjected = true
    const el = document.createElement("style")
    el.setAttribute("data-tabs-styles", "")
    el.textContent = TABS_CSS
    document.head.appendChild(el)
  }
}

/* ─── Types ───────────────────────────────────────────────── */

type TabsVariant = "default" | "line"
type TabsOrientation = "horizontal" | "vertical"

interface TabsContextValue {
  activeTab: string
  handleChange: (value: string) => void
  orientation: TabsOrientation
}

/* ─── Context ─────────────────────────────────────────────── */

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs sub-components must be rendered inside <Tabs>.")
  return ctx
}

/* ─── tabsListVariants (matches shadcn export) ────────────── */

interface TabsListVariantsOptions {
  variant?: TabsVariant
  className?: string
}

function tabsListVariants({ variant = "default", className }: TabsListVariantsOptions = {}): string {
  return cn(
    "inline-flex w-fit items-center justify-center",
    variant === "default" && "bg-muted",
    variant === "line"    && "gap-1 bg-transparent rounded-none",
    className,
  )
}

/* ─── Tabs ────────────────────────────────────────────────── */

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  orientation?: TabsOrientation
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

function Tabs({
  className,
  orientation = "horizontal",
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  useInjectTabsStyles()

  const [internal, setInternal] = React.useState<string>(() => defaultValue ?? "")
  const isControlled = controlledValue !== undefined
  const activeTab    = isControlled ? controlledValue : internal

  const handleChange = React.useCallback(
    (next: string) => {
      if (next === activeTab) return
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [activeTab, isControlled, onValueChange],
  )

  const ctx = React.useMemo<TabsContextValue>(
    () => ({ activeTab, handleChange, orientation }),
    [activeTab, handleChange, orientation],
  )

  return (
    <TabsContext.Provider value={ctx}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "flex gap-2",
          orientation === "horizontal" ? "flex-col" : "flex-row",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

/* ─── TabsList ────────────────────────────────────────────── */

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TabsVariant
}

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsListProps) {
  const { orientation } = useTabsContext()

  return (
    <div
      data-slot="tabs-list"
      data-variant={variant}
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        "inline-flex w-fit items-center justify-center text-muted-foreground",
        orientation === "horizontal" ? "h-8"                              : "h-fit flex-col",
        variant === "default"        ? "bg-muted"                         : "",
        variant === "line"           ? "gap-1 bg-transparent rounded-none" : "",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ─── TabsTrigger ─────────────────────────────────────────── */

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function TabsTrigger({
  className,
  value,
  disabled = false,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeTab, handleChange, orientation } = useTabsContext()
  const isActive = activeTab === value
  const ref = React.useRef<HTMLButtonElement>(null)

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>): void {
    const list = ref.current?.closest('[role="tablist"]')
    if (!list) return

    const all = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    )
    const idx = all.indexOf(ref.current!)
    let next = -1

    const isH = orientation === "horizontal"
    if (isH  && e.key === "ArrowRight") next = (idx + 1) % all.length
    if (isH  && e.key === "ArrowLeft")  next = (idx - 1 + all.length) % all.length
    if (!isH && e.key === "ArrowDown")  next = (idx + 1) % all.length
    if (!isH && e.key === "ArrowUp")    next = (idx - 1 + all.length) % all.length
    if (e.key === "Home")               next = 0
    if (e.key === "End")                next = all.length - 1

    if (next >= 0) {
      e.preventDefault()
      all[next]?.focus()
      all[next]?.click()
    }
  }

  return (
   <button
    ref={ref}
    data-slot="tabs-trigger"
    role="tab"
    type="button"
    aria-selected={isActive}
    data-state={isActive ? "active" : "inactive"}
    disabled={disabled}
    tabIndex={isActive ? 0 : -1}
    onClick={() => !disabled && handleChange(value)}
    onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center",
        "gap-1.5 border border-transparent px-1.5 py-0.5",
        "text-sm font-medium whitespace-nowrap",
        "transition-all",
        "text-foreground/60 hover:text-foreground",
        "dark:text-muted-foreground dark:hover:text-foreground",
        "focus-visible:outline-none focus-visible:border-ring",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        orientation === "vertical" && "w-full justify-start",
        isActive && [
          "bg-background text-foreground shadow-sm",
          "dark:border-input dark:bg-input/30 dark:text-foreground",
        ],
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── TabsContent ─────────────────────────────────────────── */

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const { activeTab } = useTabsContext()
  const isActive = activeTab === value

  if (!isActive) return null

  return (
    <div
      key={value}
      data-slot="tabs-content"
      role="tabpanel"
      tabIndex={0}
      style={{ animation: `_tabs-fade-in ${FADE_MS}ms ease both` }}
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* ─── Exports ────────────────────────────────────────────── */

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps, TabsListVariantsOptions }