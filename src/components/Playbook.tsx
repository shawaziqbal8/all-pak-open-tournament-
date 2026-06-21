import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Eraser, Pen, Trash2, Users } from 'lucide-react';

interface PlaybookProps {
  socket: Socket | null;
  usersConnected: number;
}

export default function Playbook({ socket, usersConnected }: PlaybookProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ea580c'); // orange-600
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');

  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Save current content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

        // Resize
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Restore content
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('draw-action', (data: { x0: number; y0: number; x1: number; y1: number; color: string; width: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      ctx.stroke();
      ctx.closePath();
    });

    socket.on('clear-canvas', () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw-action');
      socket.off('clear-canvas');
    };
  }, [socket]);

  const drawLine = (x0: number, y0: number, x1: number, y1: number, emit = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const strokeColor = mode === 'erase' ? '#0f172a' : color; // slate-900 for background
    const currentLineWidth = mode === 'erase' ? 20 : lineWidth;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = currentLineWidth;
    ctx.stroke();
    ctx.closePath();

    if (!emit || !socket) return;

    socket.emit('draw-action', {
      x0,
      y0,
      x1,
      y1,
      color: strokeColor,
      width: currentLineWidth,
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    lastPos.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    drawLine(lastPos.current.x, lastPos.current.y, x, y, true);
    lastPos.current = { x, y };
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (socket) socket.emit('clear-canvas');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-white">Tactics Playbook & Whiteboard</h2>
           <p className="text-sm text-slate-400">Instantly syncs drawing across all connected managers.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <button onClick={() => setMode('draw')} className={`p-2 px-4 flex items-center gap-2 text-sm font-bold transition-colors ${mode === 'draw' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Pen className="w-4 h-4" /> Draw
            </button>
            <button onClick={() => setMode('erase')} className={`p-2 px-4 flex items-center gap-2 text-sm font-bold transition-colors ${mode === 'erase' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Eraser className="w-4 h-4" /> Erase
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-lg">
             {['#ffffff', '#ea580c', '#3b82f6', '#22c55e', '#eab308', '#ef4444'].map(c => (
               <button 
                 key={c}
                 onClick={() => { setColor(c); setMode('draw'); }}
                 className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && mode === 'draw' ? 'scale-110 border-white' : 'border-transparent hover:scale-110'}`}
                 style={{ backgroundColor: c }}
               />
             ))}
          </div>

          <button onClick={clearCanvas} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Clear Canvas">
             <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[600px] w-full cursor-crosshair flex flex-col" ref={containerRef}>
        <div className="absolute top-4 left-4 pointer-events-none opacity-20 flex items-center gap-2 text-white font-black text-4xl">
           <Users className="w-8 h-8" /> {usersConnected} syncing
        </div>
        
        {/* Basketball / Volleyball Court Overlay lines could go here via CSS, keeping simple for now */}
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="absolute inset-0 w-full h-full touch-none"
        />
      </div>
    </div>
  );
}
