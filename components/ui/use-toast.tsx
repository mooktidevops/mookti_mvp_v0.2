// components/ui/use-toast.tsx
"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastOptions = {
  id?: string
  title: string
  description?: string
  variant?: string
  duration?: number
  children?: React.ReactNode
}

type ToastContextValue = {
  toast: (options: ToastOptions) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const DEFAULT_TOAST_DURATION = 5000 // Set your default duration here

const ToastProvider = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Provider>) => {
  const [toasts, setToasts] = React.useState<(ToastOptions & { id: string })[]>([])

  const toast = (options: ToastOptions) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...options, id, duration: options.duration ?? DEFAULT_TOAST_DURATION }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider {...props}>
        {children}
        <ToastViewport />
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            defaultOpen
            duration={t.duration}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id)
            }}
            className={cn(
              "relative bg-background text-foreground rounded-md shadow-lg p-4 flex flex-col space-y-1.5 " +
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out " +
              "data-[state=closed]:fade-out-100 data-[state=open]:fade-in-100 data-[swipe=end]:fade-out-100 " +
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
              t.variant === "destructive" ? "border border-red-500" : ""
            )}
          >
            {/* Close icon in the top-left corner */}
            <ToastClose
              aria-label="Close"
              className="absolute top-2 left-2 p-1 text-sm font-medium text-foreground hover:text-foreground/80"
            >
              <X className="h-4 w-4" />
            </ToastClose>

            <div className="mt-4"> {/* Add top margin so content isn't under the X */}
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
              {t.children}
            </div>
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
ToastProvider.displayName = "ToastProvider"

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-2 p-4 top-0 right-0 m-0 list-none outline-none",
        className
      )}
      {...props}
    />
  )
})
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "bg-background text-foreground rounded-md shadow-lg p-4 flex items-center space-x-3 data-[state=open]:animate-in " +
        "data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-100 " +
        "data-[state=open]:fade-in-100 data-[swipe=end]:fade-out-100 " +
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("font-semibold text-sm", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center text-sm font-medium transition-colors " +
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none " +
      "border border-transparent rounded-md px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-sm transition-colors " +
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
      , className
    )}
    {...props}
  />
))
ToastClose.displayName = ToastPrimitive.Close.displayName

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  useToast
}