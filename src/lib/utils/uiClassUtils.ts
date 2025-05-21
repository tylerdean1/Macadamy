import type { Size, Variant } from "@/lib/ui.types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge class names with Tailwind CSS
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const getVariantClasses = (
  variant: Variant,
  type: "button" | "badge",
): string => {
  if (type === "button") {
    switch (variant) {
      case "primary":
        return "bg-primary text-white hover:bg-primary-hover focus:ring-primary/50";
      case "secondary":
        return "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500/50";
      case "outline":
        return "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500/50";
      case "ghost":
        return "bg-transparent text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500/50";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50";
      default:
        return "bg-primary text-white hover:bg-primary-hover focus:ring-primary/50";
    }
  }

  // Badge
  switch (variant) {
    case "primary":
      return "bg-primary/10 text-primary";
    case "success":
      return "bg-green-500/10 text-green-500";
    case "warning":
      return "bg-yellow-500/10 text-yellow-500";
    case "danger":
      return "bg-red-500/10 text-red-500";
    case "info":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

export const getSizeClasses = (
  size: Size,
  type: "button" | "badge",
): string => {
  if (type === "button") {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2";
    }
  }

  // Badge
  switch (size) {
    case "sm":
      return "text-xs px-2 py-0.5";
    case "md":
      return "text-sm px-2.5 py-0.5";
    case "lg":
      return "text-base px-3 py-1";
    default:
      return "text-sm px-2.5 py-0.5";
  }
};
