// src/components/landlord/agreements/SigCanvas.jsx
import React, { useRef, useState } from "react";
import { HiPencilAlt, HiX } from "react-icons/hi";

export default function SigCanvas({ label, onSave, onClear }) {
  const ref  = useRef(null);
  const drag = useRef(false);
  const [has, setHas] = useState(false);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.touches ? e.touches[0].clientX : e.clientX) - r.left,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - r.top,
    };
  };

  const handleStart = e => {
    e.preventDefault();
    const c = ref.current;
    const p = getPos(e, c);
    c.getContext("2d").beginPath();
    c.getContext("2d").moveTo(p.x, p.y);
    drag.current = true;
  };

  const handleMove = e => {
    if (!drag.current) return;
    e.preventDefault();
    const c   = ref.current;
    const ctx = c.getContext("2d");
    const p   = getPos(e, c);
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHas(true);
  };

  const handleStop = () => {
    drag.current = false;
    if (has) onSave(ref.current.toDataURL());
  };

  const handleClear = () => {
    ref.current.getContext("2d").clearRect(0, 0, ref.current.width, ref.current.height);
    setHas(false);
    onClear();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</p>
        {has && (
          <button onClick={handleClear} className="text-xs text-red-500 font-bold flex items-center gap-1">
            <HiX className="text-xs"/> Clear
          </button>
        )}
      </div>
      <div className="relative border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/20 overflow-hidden">
        <canvas
          ref={ref}
          width={440}
          height={100}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={handleStart} onMouseMove={handleMove}
          onMouseUp={handleStop}   onMouseLeave={handleStop}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleStop}
        />
        {!has && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <HiPencilAlt/> Draw your signature
            </p>
          </div>
        )}
      </div>
      <div className="mt-1 border-t border-gray-300 mx-4"/>
      <p className="text-[10px] text-gray-400 text-center mt-1">{label}</p>
    </div>
  );
}