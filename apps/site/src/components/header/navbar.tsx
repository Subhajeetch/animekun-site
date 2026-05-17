"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  MessageCircleHeart,
  Sparkle,
  ChevronRight,
  BookText,
  History,
  Heart,
  CircleFadingArrowUp,
  BadgeCheck,
} from "lucide-react";

import { DiscordIcon } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";


// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  description: string;
}


const IMP_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Home, description: "Go to the home section"      },
  { id: "watch-list", label: "Watch List", href: "/watch-list", icon: BookText, description: "View your watch list"},
  { id: "history",  label: "History",  href: "/history",  icon: History,  description: "View your watch history" },
];

const NECE_NAV_ITEMS: NavItem[] = [
  { id: "most-popular", label: "Most Popular", href: "/most-popular", icon: Sparkle, description: "View most popular anime" },
  { id: "popular-genres", label: "Popular Genres", href: "/genres", icon: Heart, description: "Browse popular genres" },
  { id: "latest-updated", label: "Latest Updated", href: "/latest-updated", icon: CircleFadingArrowUp, description: "View latest updated content" },
  { id: "top-100", label: "Top 100", href: "/top-100", icon: BadgeCheck, description: "View top 100 anime" },
];


const COM__NAV_ITEMS: NavItem[] = [
  { id: "community", label: "Community", href: "/community", icon: MessageCircleHeart, description: "Go to the community section" },
  { id: "Discord", label: "Discord", href: "#discord", icon: DiscordIcon, description: "Join our Discord server" },
];


// ─── Sidebar Component ────────────────────────────────────────────────────────

function Sidebar({
  isOpen,
  activeItem,
  onClose,
  onNavClick,
  firstFocusRef,
}: {
  isOpen: boolean;
  activeItem: string;
  onClose: () => void;
  onNavClick: (id: string) => void;
  firstFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const sidebarRef = useRef<HTMLElement>(null);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "Tab" || !sidebarRef.current) return;
      const focusable = Array.from(
        sidebarRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    []
  );

  return (
    <nav
      id="main-sidebar"
      ref={sidebarRef}
      role="navigation"
      aria-label="Main site navigation"
      aria-hidden={!isOpen}
      inert={!isOpen}
      onKeyDown={handleKeyDown}
      className={[
        "fixed top-0 left-0 z-50 h-full w-[320px] flex flex-col",
        "bg-background border-r border-border",
        "transition-transform duration-380 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isOpen ? "translate-x-0 shadow-[4px_0_60px_rgba(0,0,0,0.7)]" : "-translate-x-full",
      ].join(" ")}
    >
      {/* Cyan accent edge line */}
      <div
        aria-hidden="true"
        className={[
          "absolute right-0 top-[10%] bottom-[10%] w-px",
          "bg-linear-to-b from-transparent via-primary/50 to-transparent",
          "transition-opacity duration-700",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 pt-8 pb-7 border-b border-border">
        <div>
          <p
            className="text-[10px] tracking-[0.25em] uppercase text-primary mb-1.5"
            aria-hidden="true"
          >
            Navigation
          </p>
          <span
            className="text-[30px] font-extrabold tracking-tight text-foreground leading-none"
          >
            AnimeKun
          </span>
        </div>

        <button
          ref={firstFocusRef}
          onClick={onClose}
          aria-label="Close navigation menu"
          className={[
            "w-10 h-10 md:w-11 md:h-11 flex items-center justify-center shrink-0",
            "border border-border text-muted",
            "hover:border-primary hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            "transition-all duration-200",
          ].join(" ")}
        >
          <X size={18} strokeWidth={1.5} aria-hidden={true} />
        </button>
      </div>

      {/* ── Nav Links ── */}

        <div className="flex-1 overflow-y-auto"> {/*main div*/}
            <div className="pt-5">
                <p className="text-[13px] font-bold text-primary/60 pl-5 pb-2 ">Important</p>
                <ul
                    role="list"
                    aria-label="Site sections"
                    className="flex-1 px-5 space-y-0.5"
                >
                    {IMP_NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                        <li key={item.id} role="listitem">
                        <Link
                            href={item.href}
                            aria-label={item.description}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => onNavClick(item.id)}
                            style={{
                            transitionDelay: isOpen ? `${index * 55 + 80}ms` : "0ms",
                            transitionProperty: "transform, opacity",
                            transitionDuration: "350ms, 300ms",
                            transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1), ease",
                            transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                            opacity: isOpen ? 1 : 0,
                            }}
                            className={[
                            "group relative flex items-center gap-4 px-4 py-3.5 w-full",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                            isActive
                                ? "text-primary bg-primary/5"
                                : "text-foreground/60 hover:text-primary hover:bg-primary/5",
                            "transition-colors duration-150",
                            ].join(" ")}
                        >
                            {/* Left indicator bar */}
                            <span
                            aria-hidden="true"
                            className={[
                                "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full",
                                "bg-primary transition-all duration-200",
                                isActive
                                ? "h-6 opacity-100"
                                : "h-3 opacity-0 group-hover:opacity-30 group-hover:h-5",
                            ].join(" ")}
                            />

                            {/* Index number */}
                            <span
                            aria-hidden="true"
                            className="text-[13px] text-foreground/50 w-5 text-right shrink-0 tabular-nums"
                            >
                            {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* Icon */}
                            <Icon size={18} strokeWidth={1.5} aria-hidden={true} />

                            {/* Label */}
                            <span
                            className="flex-1 text-[13px] tracking-[0.18em] uppercase font-medium"
                            >
                            {item.label}
                            </span>

                            {/* Chevron */}
                            <ChevronRight
                            size={11}
                            strokeWidth={2}
                            aria-hidden={true}
                            className={[
                                "shrink-0 transition-all duration-200",
                                isActive
                                ? "opacity-100 text-primary translate-x-0"
                                : "opacity-0 -translate-x-2 group-hover:opacity-30 group-hover:translate-x-0",
                            ].join(" ")}
                            />
                        </Link>
                        </li>
                    );
                    })}
                </ul>
            </div>

            <div className="pt-5">
                <p className="text-[13px] font-bold text-primary/60 pl-5 pb-2 ">Necessary</p>
                <ul
                    role="list"
                    aria-label="Site sections"
                    className="flex-1 px-5 pb-7 space-y-0.5"
                >
                    {NECE_NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                        <li key={item.id} role="listitem">
                        <Link
                            href={item.href}
                            aria-label={item.description}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => onNavClick(item.id)}
                            style={{
                            transitionDelay: isOpen ? `${index * 55 + 80}ms` : "0ms",
                            transitionProperty: "transform, opacity",
                            transitionDuration: "350ms, 300ms",
                            transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1), ease",
                            transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                            opacity: isOpen ? 1 : 0,
                            }}
                            className={[
                            "group relative flex items-center gap-4 px-4 py-3.5 w-full",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                            isActive
                                ? "text-primary bg-primary/5"
                                : "text-foreground/60 hover:text-primary hover:bg-primary/5",
                            "transition-colors duration-150",
                            ].join(" ")}
                        >
                            {/* Left indicator bar */}
                            <span
                            aria-hidden="true"
                            className={[
                                "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full",
                                "bg-primary transition-all duration-200",
                                isActive
                                ? "h-6 opacity-100"
                                : "h-3 opacity-0 group-hover:opacity-30 group-hover:h-5",
                            ].join(" ")}
                            />

                            {/* Index number */}
                            <span
                            aria-hidden="true"
                            className="text-[13px] text-foreground/50 w-5 text-right shrink-0 tabular-nums"
                            >
                            {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* Icon */}
                            <Icon size={18} strokeWidth={1.5} aria-hidden={true} />

                            {/* Label */}
                            <span
                            className="flex-1 text-[13px] tracking-[0.18em] uppercase font-medium"
                            >
                            {item.label}
                            </span>

                            {/* Chevron */}
                            <ChevronRight
                            size={11}
                            strokeWidth={2}
                            aria-hidden={true}
                            className={[
                                "shrink-0 transition-all duration-200",
                                isActive
                                ? "opacity-100 text-primary translate-x-0"
                                : "opacity-0 -translate-x-2 group-hover:opacity-30 group-hover:translate-x-0",
                            ].join(" ")}
                            />
                        </Link>
                        </li>
                    );
                    })}
                </ul>
            </div>

            

            <div className="pt-5">
                <p className="text-[13px] font-bold text-primary/60 pl-5 pb-2 ">Community</p>
                <ul
                    role="list"
                    aria-label="Site sections"
                    className="flex-1 px-5 pb-7 space-y-0.5"
                >
                    {COM__NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                        <li key={item.id} role="listitem">
                        <Link
                            href={item.href}
                            aria-label={item.description}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => onNavClick(item.id)}
                            style={{
                            transitionDelay: isOpen ? `${index * 55 + 80}ms` : "0ms",
                            transitionProperty: "transform, opacity",
                            transitionDuration: "350ms, 300ms",
                            transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1), ease",
                            transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                            opacity: isOpen ? 1 : 0,
                            }}
                            className={[
                            "group relative flex items-center gap-4 px-4 py-3.5 w-full",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                            isActive
                                ? "text-primary bg-primary/5"
                                : "text-foreground/60 hover:text-primary hover:bg-primary/5",
                            "transition-colors duration-150",
                            ].join(" ")}
                        >
                            {/* Left indicator bar */}
                            <span
                            aria-hidden="true"
                            className={[
                                "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full",
                                "bg-primary transition-all duration-200",
                                isActive
                                ? "h-6 opacity-100"
                                : "h-3 opacity-0 group-hover:opacity-30 group-hover:h-5",
                            ].join(" ")}
                            />

                            {/* Index number */}
                            <span
                            aria-hidden="true"
                            className="text-[13px] text-foreground/50 w-5 text-right shrink-0 tabular-nums"
                            >
                            {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* Icon */}
                            <Icon size={18} strokeWidth={1.5} aria-hidden={true} />

                            {/* Label */}
                            <span
                            className="flex-1 text-[13px] tracking-[0.18em] uppercase font-medium"
                            >
                            {item.label}
                            </span>

                            {/* Chevron */}
                            <ChevronRight
                            size={11}
                            strokeWidth={2}
                            aria-hidden={true}
                            className={[
                                "shrink-0 transition-all duration-200",
                                isActive
                                ? "opacity-100 text-primary translate-x-0"
                                : "opacity-0 -translate-x-2 group-hover:opacity-30 group-hover:translate-x-0",
                            ].join(" ")}
                            />
                        </Link>
                        </li>
                    );
                    })}
                </ul>
            </div>
        </div>

      {/* ── Footer ── */}
      <div className="px-8 py-6 border-t border-border">
        <p className="text-[10px] text-foreground/50 tracking-widest">
          v1.0.0 &mdash; &copy; {new Date().getFullYear()}
        </p>
      </div>
    </nav>
  );
}

// ─── Backdrop ─────────────────────────────────────────────────────────────────

function Backdrop({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={[
        "fixed inset-0 z-40 bg-black/65 backdrop-blur-[3px]",
        "transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    />
  );
}

// ─── Menu Button ─────────────────────────────────────────────────────────────

function MenuButton({
  isOpen,
  triggerRef,
  toggleNavMenu,
}: {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  toggleNavMenu: () => void;
}) {
  return (
    <button
      ref={triggerRef}
      onClick={toggleNavMenu}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
      aria-controls="main-sidebar"
      aria-haspopup="true"
      className={[
        "bg-background rounded-none w-10 h-10 md:w-11 md:h-11 flex items-center justify-center",
        "border border-border",
        "text-foreground/50 hover:text-primary hover:border-primary",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        "transition-all duration-200 shadow-lg",
      ].join(" ")}
    >
      <Menu size={18} strokeWidth={1.5} aria-hidden={true} />
    </button>
  );
}




export const NavMenuButton = MenuButton;

export const useNavMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("home");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Mount flag for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Move focus into sidebar on open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => firstFocusRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleOpen = useCallback(() => {
  setIsOpen(true);
}, []);

const handleClose = useCallback(() => {
  setIsOpen(false);
  triggerRef.current?.focus();
}, []);

const toggleNavMenu = useCallback(() => {
  console.log("Toggling nav menu. Current state:", isOpen);
  setIsOpen((prev) => !prev);
}, []);

const handleNavClick = useCallback((id: string) => {
  setActiveItem(id);
  handleClose();
}, [handleClose]);

  const menuPortal = mounted && createPortal(
    <>
      <Backdrop isOpen={isOpen} onClick={handleClose} />
      <Sidebar
        isOpen={isOpen}
        activeItem={activeItem}
        onClose={handleClose}
        onNavClick={handleNavClick}
        firstFocusRef={firstFocusRef}
      />
    </>,
    document.body
  );

  return {
  isOpen,
  activeItem,
  triggerRef,
  handleOpen,
  handleClose,
  toggleNavMenu,
  menuPortal,
};
};

// ─── Root Component ───────────────────────────────────────────────────────────

export default function SideNav() {
  const { isOpen, activeItem, triggerRef, toggleNavMenu, menuPortal } = useNavMenu();

  const tryToggleNavMenu = () => {
    console.log("Trying to toggle nav menu from SideNav component");
  };

  return (
    <>
      {/* Skip-to-content link for keyboard/screen-reader users */}
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:px-4 focus:py-2 focus:bg-primary focus:text-zinc-950 focus:text-sm focus:font-bold"
      >
        Skip to main content
      </Link>
        <MenuButton isOpen={isOpen} toggleNavMenu={toggleNavMenu} triggerRef={triggerRef} />

      {menuPortal}
    </>
  );
}