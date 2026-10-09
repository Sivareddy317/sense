import React, { useState } from 'react';
import { UserRole, CityScene, WeatherEvent } from '../../types/weather';
import { Search, Bell, Shield, Radio, Check, ChevronDown, Sparkles, ExternalLink } from 'lucide-react';
import { CITIES_DATA } from '../../data/cities';

interface TopBarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onSearchSelectCity: (city: CityScene) => void;
  onOpenNotifications: () => void;
  weatherEvents: WeatherEvent[];
  selectedCity: CityScene | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole,
  onChangeRole,
  isDemoMode,
  onToggleDemoMode,
  onSearchSelectCity,
  onOpenNotifications,
  weatherEvents,
  selectedCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const citiesList = Object.values(CITIES_DATA);
  const filteredCities = searchQuery.trim()
    ? citiesList.filter(
        (c) =>
          c.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const roles: UserRole[] = ['OPERATOR', 'ANALYST', 'ADMIN', 'CITIZEN'];

  return (
    <header className="relative z-40 flex items-center justify-between h-14 px-4 bg-[#091122]/95 border-b border-slate-800 text-slate-100 backdrop-blur-md">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base text-white">HIKARI SENSE</span>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                SIH 26069
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-none">
              National Weather Big Data Analytics Platform · <span className="text-slate-300">The Wind Breakers</span>
            </div>
          </div>
        </div>

        {/* Live Heartbeat */}
        <div className="hidden md:flex items-center gap-2 pl-4 ml-3 border-l border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-mono text-[11px] font-semibold">LIVE INGEST</span>
        </div>
      </div>

      {/* Global City Search with instant autocomplete */}
      <div className="relative w-72 md:w-96">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#050914] border border-slate-700/80 rounded-lg focus-within:border-cyan-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search City, State, or Weather Event..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#091122] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            {filteredCities.length > 0 ? (
              <div className="p-1 max-h-64 overflow-y-auto">
                {filteredCities.map((city) => {
                  const ev = weatherEvents.find((e) => e.city === city.cityName);
                  return (
                    <button
                      key={city.cityId}
                      onClick={() => {
                        onSearchSelectCity(city);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{city.cityName}</div>
                        <div className="text-[11px] text-slate-400">
                          {city.district}, {city.state}
                        </div>
                      </div>
                      {ev && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {ev.rainfall} mm
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center">No matching city found in registry.</div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: DisasterAI Link, Mode Toggle, Role Badge, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Prominent DisasterAI Response Button */}
        <a
          href="https://disaster-ai-production.up.railway.app/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-rose-900/80 via-rose-950 to-slate-900 border border-rose-500/80 hover:border-rose-400 text-rose-100 hover:text-white shadow-md shadow-rose-950/60 transition-all cursor-pointer group shrink-0"
          title="Open Deployed DisasterAI Response System"
        >
          <span className="text-sm leading-none animate-pulse">🚨</span>
          <span className="font-mono text-[11px] tracking-wide text-rose-200 group-hover:text-white">
            DisasterAI Response
          </span>
          <ExternalLink className="w-3 h-3 text-rose-400 group-hover:text-white transition-colors" />
        </a>

        {/* DEMO / SIMULATED indicator & toggle */}
        <button
          onClick={onToggleDemoMode}
          title="Toggle Simulation vs Real API Connector Mode"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer bg-slate-900/80 border-slate-700 hover:border-slate-500 text-slate-300"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span className="text-[11px] font-mono font-medium">
            {isDemoMode ? 'SIMULATED DATA' : 'LIVE TELEMETRY'}
          </span>
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          title="Active Disaster Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#091122]" />
        </button>

        {/* RBAC Role Selector */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#091122] border border-slate-700 rounded-lg shadow-xl p-1 z-50">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onChangeRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                    currentRole === role ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono">{role}</span>
                  {currentRole === role && <Check className="w-3 h-3 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
