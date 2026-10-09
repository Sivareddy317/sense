import React from 'react';
import {
  Globe,
  Map,
  CloudLightning,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Radio,
  Sparkles,
  Users,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'globe'
  | 'india_map'
  | 'events'
  | 'predictions'
  | 'disaster_risk'
  | 'alerts'
  | 'sensors'
  | 'ai_insights'
  | 'citizen_reports'
  | 'audit_log'
  | 'gov_portals';

interface LeftNavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadAlertCount: number;
}

export const LeftNavigation: React.FC<LeftNavigationProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  unreadAlertCount,
}) => {
  const menuItems = [
    { id: 'india_map', label: 'India Weather Map (Google)', icon: Map },
    { id: 'globe', label: '3D Globe & Earth', icon: Globe },
    { id: 'gov_portals', label: 'SACHET & IMD Portals', icon: Shield },
    { id: 'events', label: 'Weather Events', icon: CloudLightning },
    { id: 'predictions', label: 'Prediction Engine', icon: TrendingUp },
    { id: 'disaster_risk', label: 'Disaster Risk Analysis', icon: BarChart3 },
    { id: 'alerts', label: 'NDMA Alerts', icon: AlertTriangle, badge: unreadAlertCount },
    { id: 'sensors', label: 'Sensor Network (DWR)', icon: Radio },
    { id: 'ai_insights', label: 'AI Weather Synthesis', icon: Sparkles },
    { id: 'citizen_reports', label: 'Citizen Field Reports', icon: Users },
    { id: 'audit_log', label: 'Disaster Audit Log', icon: FileText },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col bg-[#091122]/95 border-r border-slate-800 transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
