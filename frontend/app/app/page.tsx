'use client'

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react"
import { SendHorizontal as Send } from 'lucide-react';

export default function InputFile() {
  const [preview, setPreview] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleImageClick = () => {
    const fileInput = document.getElementById('picture') as HTMLInputElement;
    fileInput?.click();
  };

  const handleSend = () => {
    setTextValue('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Field className="flex text-center relative p-4 -mt-40">
        <FieldLabel className="
          w-full justify-center text-center
          text-3xl">Image Scan</FieldLabel>
        <FieldLabel className="
          w-full justify-center text-center
          text-lg">Solve your math question, step by step, by uploading an image</FieldLabel>
        <div className="
            max-w-167.5 min-h-50
            mx-auto border-2
            border-dashed border-gray-300 rounded-md 
            zIndex-1 bg-text-input/60 flex 
            items-center justify-center">
          <Input 
            id="picture" 
            type="file"
            onChange={handleFileChange}
            className={preview ? "hidden" : "w-full h-50 text-transparent"}
            data-testid="picture"
          />
          {!preview && <Camera size={48} className="absolute
          bottom-30 pointer-events-none text-black"/>}
          {preview && (
          <img
            src={preview}
            alt="preview"
            onClick={handleImageClick}
            className="mt-4 mx-auto max-w-full 
            h-auto rounded-md  zIndex-0 cursor-pointer 
            hover:opacity-90 transition-opacity"
          />
          )}
        </div>
        {!preview && (
          <div className="relative w-175 max-w-175 mx-auto">
            <Textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text"
              className="
              h-25 w-full 
              absolute bottom-0 left-1/2 
              transform -translate-x-1/2 
              bg-text-input border-2 border-dashed 
              border-black/50 rounded-md pr-12"/>
            <button
              onClick={handleSend}
              className="absolute bottom-2 right-3 pointer-events-auto z-10">
              <Send size={30} className="text-black hover:text-gray-700" />
            </button>
          </div>
        )}
      </Field>
    </div>
  )
}
