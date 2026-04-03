import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Loader2, ChevronsUpDown } from 'lucide-react';
import { motion } from 'motion/react';
import { recognizeHandwriting } from '../lib/recognition';

interface DrawingBoardProps {
  onRecognized: (value: number, text: string) => void;
  onClear: () => void;
  resetKey?: number;
}

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ onRecognized, onClear, resetKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (resetKey !== undefined) {
      clearCanvas();
    }
  }, [resetKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on display size, but cap it for faster processing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      // Cap resolution at 400px width for faster upload/processing
      const scale = Math.min(1, 400 / rect.width);
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 8 * scale; // Adjust line width based on scale
      ctx.strokeStyle = '#000000';
      
      // Fill background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale factor between display size and internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
        y: ((e as React.MouseEvent).clientY - rect.top) * scaleY
      };
    }
  };

  const [countdown, setCountdown] = useState<number | null>(null);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setIsDrawing(true);
    setLastPos(getPos(e));
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const currentPos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    setLastPos(currentPos);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Start 0.8 second timer before processing
    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    let timeLeft = 0.8;
    setCountdown(timeLeft);
    
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdown(null);
      } else {
        setCountdown(timeLeft);
      }
    }, 100);

    processingTimerRef.current = setTimeout(() => {
      processDrawing();
    }, 800);
  };

  const processDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsProcessing(true);
    setCountdown(null);
    // Use JPEG with lower quality for faster upload
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    const result = await recognizeHandwriting(dataUrl);
    onRecognized(result.value, result.text);
    setIsProcessing(false);
  };

  const clearCanvas = () => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onClear();
  };

  return (
    <div className="relative w-full flex items-center gap-2">
      {/* Scroll Gutter Left - Only on one side for easier scrolling */}
      <div className="w-12 h-32 bg-slate-100/80 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 shrink-0 touch-pan-y active:bg-slate-200 transition-colors border border-slate-200/50">
        <ChevronsUpDown size={14} className="mb-1" />
        <div className="w-1 h-1 bg-current rounded-full" />
        <div className="w-1 h-1 bg-current rounded-full" />
        <div className="w-1 h-1 bg-current rounded-full" />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Scroll</span>
      </div>

      <div className="relative flex-1 aspect-[3/2] bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={clearCanvas}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors shadow-sm"
            title="Clear Board"
          >
            <Eraser size={20} />
          </button>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-600" size={32} />
              <span className="text-xs font-medium text-slate-600">Recognizing...</span>
            </div>
          </div>
        )}

        {!hasDrawn && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <p className="text-slate-400 font-medium">Draw quantity here</p>
          </div>
        )}
      </div>
    </div>
  );
};
