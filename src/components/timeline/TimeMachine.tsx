import React, { useState, useEffect } from 'react';
import { TimeStep } from '../../types/weather';
import { Play, Pause, SkipBack, SkipForward, Clock, History } from 'lucide-react';

interface TimeMachineProps {
  timeStep: TimeStep;
  onChangeTimeStep: (step: TimeStep) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const TimeMachine: React.FC<TimeMachineProps> = ({
  timeStep,
  onChangeTimeStep,
  isPlaying,
  onTogglePlay,
}) => {
  const steps: { val: TimeStep; label: string; tag: string }[] = [
    { val: -12, label: '-12 Hours', tag: 'HISTORICAL' },
    { val: -6, label: '-6 Hours', tag: 'RADAR LOG' },
    { val: 0, label: 'Current Observation', tag: 'LIVE' },
    { val: 6, label: '+6 Hours', tag: 'PREDICTION' },
    { val: 12, label: '+12 Hours', tag: 'PREDICTION' },
    { val: 24, label: '+24 Hours', tag: 'FORECAST' },
    { val: 48, label: '+48 Hours', tag: 'OUTLOOK' },
  ];

  // Auto-play through time steps
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const currentIndex = steps.findIndex((s) => s.val === timeStep);
      const nextIndex = (currentIndex + 1) % steps.length;
      onChangeTimeStep(steps[nextIndex].val);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, timeStep, steps, onChangeTimeStep]);

  const currentStepObj = steps.find((s) => s.val === timeStep) || steps[2];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[680px] max-w-[94vw] bg-[#091122]/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-slate-100">
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        {/* Play / Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950'
            }`}
            title={isPlaying ? 'Pause Timeline' : 'Play Timeline Progression'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              const idx = steps.findIndex((s) => s.val === timeStep);
              if (idx > 0) onChangeTimeStep(steps[idx - 1].val);
            }}
            disabled={timeStep === -12}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-600 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const idx = steps.findIndex((s) => s.val === timeStep);
              if (idx < steps.length - 1) onChangeTimeStep(steps[idx + 1].val);
            }}
            disabled={timeStep === 48}
            className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-600 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Current Time Horizon Badge */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-white">{currentStepObj.label}</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              timeStep === 0
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : timeStep < 0
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
            }`}
          >
            {currentStepObj.tag}
          </span>
        </div>
      </div>

      {/* Scrubber Track */}
      <div className="relative flex items-center justify-between px-2 pt-1 pb-1">
        {/* Connecting line */}
        <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-800 z-0" />

        {steps.map((s) => {
          const isSelected = s.val === timeStep;
          return (
            <button
              key={s.val}
              onClick={() => onChangeTimeStep(s.val)}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-cyan-400 border-white scale-125 shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-900 border-slate-700 group-hover:border-cyan-400'
                }`}
              />
              <span
                className={`mt-1.5 text-[10px] font-mono transition-colors ${
                  isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {s.val === 0 ? 'LIVE' : s.val > 0 ? `+${s.val}h` : `${s.val}h`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
