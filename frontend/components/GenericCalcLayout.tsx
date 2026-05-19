"use client"

import * as React from "react"
import { FunctionSelector } from "@/components/calculator/FunctionSelector"
import { Keypad } from "@/components/calculator/Keypad"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Camera, Send, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"


// TODO FOR LATER, make it like symbolab where it highlights empty stuff like (_), 
// this just ui/ux stuff, not breaking feature 

// TODO the internals of the textbox should automatically parse to Katex/Latex, same with the scanner page
export function GenericCalcPage({ SolutionScreen, topic }: { SolutionScreen?: React.ReactNode, topic: string }) {
  const [expression, setExpression] = React.useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFunctionsOpen, setIsFunctionsOpen] = React.useState(false);
  const [isKeypadOpen, setIsKeypadOpen] = React.useState(false);
  const [isSolving, setIsSolving] = React.useState(false);
  const [hasResult, setHasResult] = React.useState(false);

  const handleSolve = async () => {
    if (!expression.trim()) return;
    setIsSolving(true);
    setHasResult(false);
    
    // Simulate backend delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSolving(false);
    setHasResult(true);
  };

  const handleKeyPress = (key: string) => {
    if (!inputRef.current) return;

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;

    // List of words that should be treated as single entities for deletion, 
    // theres probably a better way to do this
    const keywords = [
        "sin", "cos", "tan", 
        "log", "ln", "abs", 
        "mod", "asin", "acos", 
        "atan", "floor", "ceil", 
        "trunc", "round", "factorial", 
        "random", "combinations", "permutations", 
        "derivative", "integral", "limit", 
        "sum", "product"
      ];

    switch (key) {
      case "BACKSPACE":
        if (start === end) {
          let deleteCount = 1;
          const textBefore = expression.slice(0, start);
          
          for (const word of keywords) {
            if (textBefore.endsWith(word)) {
              deleteCount = word.length;
              break;
            }
          }

          setExpression((prev) => prev.slice(0, start - deleteCount) + prev.slice(start));
          setTimeout(() => inputRef.current?.setSelectionRange(start - deleteCount, start - deleteCount), 0);
        } else {
          setExpression((prev) => prev.slice(0, start) + prev.slice(end));
          setTimeout(() => inputRef.current?.setSelectionRange(start, start), 0);
        }
        break;
      case "LEFT":
        {
          let moveCount = 1;
          const textBefore = expression.slice(0, start);
          for (const word of keywords) {
            if (textBefore.endsWith(word)) {
              moveCount = word.length;
              break;
            }
          }
          inputRef.current.setSelectionRange(start - moveCount, start - moveCount);
        }
        break;
      case "RIGHT":
        {
          let moveCount = 1;
          const textAfter = expression.slice(start);
          for (const word of keywords) {
            if (textAfter.startsWith(word)) {
              moveCount = word.length;
              break;
            }
          }
          inputRef.current.setSelectionRange(start + moveCount, start + moveCount);
        }
        break;
      default:
        setExpression((prev) => prev.slice(0, start) + key + prev.slice(end));
        setTimeout(() => {
          const newPos = start + key.length;
          inputRef.current?.setSelectionRange(newPos, newPos);
        }, 0);
    }
    inputRef.current.focus();
  };

  return (
    <div className="flex flex-col min-h-screen h-full bg-slate-50/10">

      <main className="flex flex-col xl:flex-row p-4 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-2 flex flex-col gap-4">
          <section className="flex flex-col gap-4 p-4 bg-white rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">{topic}</h2>
            <div className="group gap-2 flex flex-row items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  className="text-lg pr-28 rounded-xl border-slate-200 focus:ring-slate-300 w-full resize-none"
                  placeholder="x² - 2x + 1 = 0"
                  value={expression}
                  onChange={(e) => {
                    setExpression(e.target.value);
                  }}
                  autoFocus
                  onFocus={() => setIsKeypadOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSolve();
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex flex-row gap-2">
                  <Button 
                    variant='ghost'
                    disabled={!expression.trim() || isSolving}
                    className="aspect-square h-10 w-10 shrink-0 p-0 rounded-lg"
                    onClick={handleSolve}
                  >
                    {isSolving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="hover:bg-slate-100 aspect-square border h-12 w-12 text-slate-500 transition-colors shrink-0 p-0"
                onClick={() => {}}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>

          </section>
        
          <div className="flex gap-2 w-full h-full">
              <div className="hidden w-full xl:flex xl:flex-row gap-2">
                  <FunctionSelector onSelect={(f) => handleKeyPress(f)} />
                  <Keypad 
                      onKeyPress={handleKeyPress} 
                      onOpenFunctions={() => setIsFunctionsOpen(true)}
                      onSwitchToQwerty={() => {}} // TODO ?
                  />
              </div>
          </div>
        </div>
        <div className={"flex-1 flex flex-col h-full items-center justify-center p-8 border border-dashed rounded-xl text-center text-slate-400 font-medium " + (hasResult ? " bg-white" : "bg-slate-100")}>
          {isSolving ? (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-zinc-300" />
                <p className="text-zinc-400 animate-pulse">Calculating steps...</p>
             </div>
          ) : hasResult ? (
            <div className="w-full text-slate-900 h-full">
               {SolutionScreen}
            </div>
          ) : (
             <div className="flex flex-col items-center gap-2">
                <p className="text-lg">Enter a problem to be solved</p>
                <p className="text-sm opacity-60">Click the send button or press Enter</p>
             </div>
          )}
        </div>


        {/* Mobile */}
        <div className={"xl:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t p-2"}>
            <Sheet open={isKeypadOpen} onOpenChange={(open) => setIsKeypadOpen(open)}>
                <SheetContent side="bottom" className="h-[65vh] p-0 rounded-t-3xl xl:hidden overflow-hidden shadow-2xl" onClose={() => setIsKeypadOpen(false)}>
                    <SheetHeader className="p-4 border-b bg-slate-50/50">
                        <SheetTitle className="text-center font-bold text-slate-700">----</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto pb-10">
                        <Keypad 
                          onKeyPress={handleKeyPress} 
                          onOpenFunctions={() => setIsFunctionsOpen(true)}
                          onSwitchToQwerty={() => {
                            inputRef.current?.focus()
                          }}

                          className="border-none shadow-none p-2 bg-transparent"
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>

        {/* THe Sheet state is used to control visibility but the content is handled by our components */}
        <Sheet open={isFunctionsOpen} onOpenChange={setIsFunctionsOpen}>
            <SheetContent side="bottom" className="h-[60vh] sm:max-w-xl mx-auto p-0 flex flex-col bg-slate-50 rounded-t-3xl shadow-2xl overflow-hidden border-none">
              <SheetHeader className="p-6 border-b bg-white">
                <SheetTitle className="text-xl font-bold text-slate-900">Function Library</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden p-4">
                  <FunctionSelector 
                    onSelect={(f) => {
                      handleKeyPress(f)
                      setIsFunctionsOpen(false)
                    }} 
                    onClose={() => setIsFunctionsOpen(false)}
                   />
              </div>
            </SheetContent>
        </Sheet>
      </main>
    </div>
  )
}




