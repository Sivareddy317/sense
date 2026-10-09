import React, { useEffect, useState } from 'react';
import { CityScene } from '../../types/weather';
import { Loader2, CheckCircle2, Navigation, Layers, CloudRain, Building } from 'lucide-react';

interface CityLoadingOverlayProps {
  city: CityScene;
  onComplete: () => void;
}

export const CityLoadingOverlay: React.FC<CityLoadingOverlayProps> = ({ city, onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { text: `Targeting coordinates: ${city.latitude.toFixed(4)}°N, ${city.longitude.toFixed(4)}°E`, icon: Navigation },
    { text: `Streaming 3D terrain mesh (${city.terrain_type} elevation model)...`, icon: Layers },
    { text: `Generating ${city.buildings.length} volumetric buildings & landmark structures...`, icon: Building },
    { text: `Synthesizing ${city.roads.length} road corridors & dynamic traffic flow...`, icon: Layers },
    { text: 'Simulating localized radar precipitation particles & event dome...', icon: CloudRain },
    { text: `${city.cityName.toUpperCase()} 3D URBAN ENVIRONMENT READY`, icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 350);
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(timer);
  }, [city, onComplete, steps.length]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050914]/80 backdrop-blur-md transition-opacity">
      <div className="w-[420px] max-w-[90vw] p-6 bg-[#091122] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
              DESCENT TO {city.cityName}, {city.state}
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">SIH 26069</span>
        </div>

        <div className="space-y-3 mb-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = idx < step;
            const isCurrent = idx === step;
            const isPending = idx > step;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-colors ${
                  isCurrent
                    ? 'text-cyan-300 font-medium'
                    : isCompleted
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="truncate">{s.text}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
