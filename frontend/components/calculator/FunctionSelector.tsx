"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"

interface FunctionSelectorProps {
  onSelect: (func: string) => void
  onClose?: () => void
}

const functionCategories = [
  {
    name: "Standard",
    items: ["asin", "acos", "atan", "floor", "ceil", "trunc", "round"],
  },
  {
    name: "Probability",
    items: ["factorial", "random", "combinations", "permutations"],
  },
  {
    name: "Advanced",
    items: ["derivative", "integral", "limit", "sum", "product"],
  },
]

export function FunctionSelector({ onSelect, onClose }: FunctionSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredCategories = functionCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  return (
    <div className="flex w-full flex-col h-full bg-background rounded-xl border shadow-xl overflow-hidden min-h-[400px]">
      <div className="p-4 border-b flex flex-col gap-3 sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Functions</h2>
          {onClose && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-muted/50 focus-visible:ring-1"
            placeholder="Search functions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-6 p-2">
          {filteredCategories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-primary-main px-1 uppercase tracking-tighter">
                {cat.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {cat.items.map((func) => (
                  <Button
                    key={func}
                    variant="outline"
                    className="h-9 justify-start text-xs bg-slate-50/50 hover:bg-slate-100 transition-colors"
                    onClick={() => {
                        onSelect(func + "()")
                        onClose?.()
                    }}
                  >
                    {func}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground italic">
              {'No functions found matching "' + searchTerm + '"'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
