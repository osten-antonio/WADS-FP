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

export function Keypad({ onKeyPress, onOpenFunctions, onSwitchToQwerty,  className }: KeypadProps) {
  const [isInverse, setIsInverse] = React.useState(false)

  const normalKeys = [
    ["x²", "x^n", "|x|", "e", "ln"],
    ["(",")","^","√x", "log"],
    ["7", "8", "9", "/", "sin"],
    ["4", "5", "6", "*", "cos"],
    ["1", "2", "3", "-", "tan"],
    ["0", ".", "=", "+", "π"],
  ]

  const inverseKeys = [
    ["√x", "log_n", "floor", "π", "e^x"],
    ["[", "]", "!", "³√x", "10^x"],
    ["7", "8", "9", "/", "asin"],
    ["4", "5", "6", "*", "acos"],
    ["1", "2", "3", "-", "atan"],
    ["0", ".", "=", "+", "φ"],
  ]

  const keys = isInverse ? inverseKeys : normalKeys

   // TODO change it to function shortcuts
  const shortcuts = ["x²", "√x", "log", "ln", "e", "^", "(", ")", "abs", "mod"]

  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-muted/30 rounded-xl border shadow-sm xl:max-w-80 2xl:max-w-120", className)}>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {shortcuts.map((s) => (
          <Button
            key={s}
            variant="secondary"
            className="px-10 h-10 shrink-0 bg-button-light/60 hover:bg-button-light/70 text-accent-main/60"
            onClick={() => onKeyPress(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex gap-1 mr-10">
          <Button 
            variant={isInverse ? "default" : "outline"} 
            className={cn("h-14 flex-1 xl:flex-2", isInverse && "bg-primary-dark/70 hover:bg-primary-main transition-colors")}
            onClick={() => setIsInverse(!isInverse)}
          >
            2nd
          </Button>
          <Button 
            variant="outline" 
            className="h-14 flex-2 xl:hidden"
            onClick={onSwitchToQwerty}
          >  
            <Keyboard className="h-5 w-5" /> 
          </Button>
        </div>

        <Button 
          variant="outline" 
          className="h-14 ml-10 bg-amber-50/50 hover:bg-amber-100 flex gap-2 items-center justify-center transition-colors"
          onClick={() => onKeyPress("BACKSPACE")}
        >
          <Delete className="h-5 w-5 text-amber-700" />
          <span className="text-amber-700 font-medium md:hidden lg:inline">Delete</span>
        </Button>

          <Button 
            variant="outline" 
            className="h-14 px-4 flex gap-2 items-center mr-10 xl:invisible"
            onClick={onOpenFunctions}
          >
            <span className="font-medium text-primary-main/90">Func</span>
          </Button>
          <div className="flex-1 flex gap-1 ml-10">
            <Button variant="outline" className="h-14 flex-1 p-0" onClick={() => onKeyPress("LEFT")}>
              <MoveLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="h-14 flex-1 p-0" onClick={() => onKeyPress("RIGHT")}>
              <MoveRight className="h-5 w-5" />
            </Button>
          </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-5 gap-1">
        {keys.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                className={cn(
                  "h-10 text-md font-medium",
                  ["/", "*", "-", "+", "="].includes(key) && "!bg-accent-main text-white border-white border hover:!bg-accent-main/70 hover:text-white/90 transition-colors"
                )}
                onClick={() => onKeyPress(key)}
              >
                {key}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </div>
      </div>
  )
}
