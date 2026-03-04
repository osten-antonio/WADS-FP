"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Delete, Eraser, MoveLeft, MoveRight, Keyboard } from "lucide-react"

interface KeypadProps {
  onKeyPress: (key: string) => void
  onOpenFunctions: () => void
  onSwitchToQwerty: () => void
  className?: string
}

// TODO make the function disappear/reappear accordingly
// FIXME move stuff, rn very messy/unintuitive
export function Keypad({ onKeyPress, onOpenFunctions, onSwitchToQwerty,  className }: KeypadProps) {
  const keys = [
    ["7", "8", "9", "/", "sin"],
    ["4", "5", "6", "*", "cos"],
    ["1", "2", "3", "-", "tan"],
    ["0", ".", "=", "+", "π"],
  ]

   // TODO enhance this or move to keypad, cur one is general, also make it topic specific if can
  const shortcuts = ["x²", "√x", "log", "ln", "e", "^", "(", ")", "abs", "mod"]

  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-muted/30 rounded-xl border shadow-sm", className)}>
      {/* TODO make it actually scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {shortcuts.map((s) => (
          <Button
            key={s}
            variant="secondary"
            className="px-2 h-10 shrink-0 bg-blue-100/50 hover:bg-blue-200 text-blue-900 border-blue-200"
            onClick={() => onKeyPress(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-5 gap-1">
        {keys.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((key) => (
              <Button
                key={key}
                variant={["/", "*", "-", "+", "="].includes(key) ? "default" : "outline"}
                className={cn(
                  "h-10 text-md font-medium",
                  key === "=" ? "bg-primary text-primary-foreground" : ""
                )}
                onClick={() => onKeyPress(key)}
              >
                {key}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="grid grid-cols-4 gap-2">
        <Button 
          variant="outline" 
          className="h-14 md:hidden"
          onClick={onSwitchToQwerty}
          title="Switch to QWERTY"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          className="h-14"
          onClick={onOpenFunctions}
        >
          Functions
        </Button>
        <div className="flex gap-1">
          <Button variant="outline" className="h-14 flex-1" onClick={() => onKeyPress("LEFT")}>
            <MoveLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-14 flex-1" onClick={() => onKeyPress("RIGHT")}>
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          className="h-14 gap-2 bg-amber-50"
          onClick={() => onKeyPress("BACKSPACE")}
        >
          <Delete className="h-5 w-5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  )
}
