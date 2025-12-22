import React, { useState } from 'react';
import { Plus, Eraser, ZoomIn, ZoomOut, BarChart3, Settings, Download, X, Sun, Moon } from 'lucide-react';
import { AppSettings } from '@/types/habit';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

interface ToolbarProps {
  settings: AppSettings;
  isErasing: boolean;
  onToggleErase: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddHabit: () => void;
  onToggleAnalytics: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onExport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  isErasing,
  onToggleErase,
  onZoomIn,
  onZoomOut,
  onAddHabit,
  onToggleAnalytics,
  onUpdateSettings,
  onExport,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="floating-panel flex items-center gap-1 p-2"
      >
        <button
          onClick={onAddHabit}
          className="toolbar-button"
          title="Add Habit (A)"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={onToggleErase}
          className={`toolbar-button ${isErasing ? 'active' : ''}`}
          title="Toggle Eraser (E)"
          disabled={settings.noUndoMode}
        >
          <Eraser className={`w-5 h-5 ${settings.noUndoMode ? 'opacity-30' : ''}`} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={onZoomOut}
          className="toolbar-button"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(settings.zoom * 100)}%
        </span>
        
        <button
          onClick={onZoomIn}
          className="toolbar-button"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={onToggleAnalytics}
          className="toolbar-button"
          title="Analytics (D)"
        >
          <BarChart3 className="w-5 h-5" />
        </button>

        <button
          onClick={onExport}
          className="toolbar-button"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="toolbar-button"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`toolbar-button ${showSettings ? 'active' : ''}`}
          title="Settings (S)"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="floating-panel absolute bottom-16 left-1/2 -translate-x-1/2 p-4 w-64"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Modes</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Pressure Mode</p>
                  <p className="text-xs text-muted-foreground">Missed days feel heavier</p>
                </div>
                <Switch
                  checked={settings.pressureMode}
                  onCheckedChange={(checked) => onUpdateSettings({ pressureMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">No-Undo Mode</p>
                  <p className="text-xs text-muted-foreground">Can't erase completed days</p>
                </div>
                <Switch
                  checked={settings.noUndoMode}
                  onCheckedChange={(checked) => onUpdateSettings({ noUndoMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Silent Mode</p>
                  <p className="text-xs text-muted-foreground">Hide all streaks</p>
                </div>
                <Switch
                  checked={settings.silentMode}
                  onCheckedChange={(checked) => onUpdateSettings({ silentMode: checked })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toolbar;
