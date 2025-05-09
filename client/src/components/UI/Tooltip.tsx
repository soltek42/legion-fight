import * as React from "react";
import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

// export default function Tooltip({
//   content,
//   children,
//   position = "top",
//   className,
// }: TooltipProps) {
//   const [isVisible, setIsVisible] = React.useState(false);
//   const tooltipRef = React.useRef<HTMLDivElement>(null);

//   // Calculate tooltip position based on the specified direction
//   const getPositionStyles = () => {
//     switch (position) {
//       case "top":
//         return "bottom-full left-1/2 -translate-x-1/2 mb-2";
//       case "bottom":
//         return "top-full left-1/2 -translate-x-1/2 mt-2";
//       case "left":
//         return "right-full top-1/2 -translate-y-1/2 mr-2";
//       case "right":
//         return "left-full top-1/2 -translate-y-1/2 ml-2";
//       default:
//         return "bottom-full left-1/2 -translate-x-1/2 mb-2";
//     }
//   };

//   // Add arrow based on position
//   const getArrowStyles = () => {
//     switch (position) {
//       case "top":
//         return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent";
//       case "bottom":
//         return "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent";
//       case "left":
//         return "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent";
//       case "right":
//         return "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent";
//       default:
//         return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent";
//     }
//   };

//   return (
//     <div className="relative inline-block">
//       <div
//         onMouseEnter={() => setIsVisible(true)}
//         onMouseLeave={() => setIsVisible(false)}
//         className="inline-block"
//       >
//         {children}
//       </div>

//       {isVisible && (
//         <div
//           ref={tooltipRef}
//           className={cn(
//             "absolute z-50 w-max max-w-xs px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg",
//             getPositionStyles(),
//             className
//           )}
//         >
//           {content}
//           <div
//             className={cn(
//               "absolute w-0 h-0 border-4 border-solid border-gray-900",
//               getArrowStyles()
//             )}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
