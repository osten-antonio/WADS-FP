import { Eye, EyeOff } from "lucide-react";
import { InputGroupButton } from "../ui/input-group";
import { useState } from "react";

export function HintBox({ number, hint }: { number: number, hint: string }){
    const [hintHidden, setHintHidden] = useState(false)
    
    const toggleHintHidden = () => setHintHidden((s) => !s)

    return (
        <div className="flex items-center justify-between w-full border rounded-md p-2">
            <div className="text-sm">Hint {number}: {hintHidden ? '••••' : hint}</div>
            <InputGroupButton aria-label={hintHidden ? 'Unhide hint' : 'Hide hint'} onClick={toggleHintHidden} size="icon-xs">
                {hintHidden ? <EyeOff /> : <Eye />}
            </InputGroupButton>
        </div>
    )
}