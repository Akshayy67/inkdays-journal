import React, { useState } from 'react';
import { Plus, Eraser, ZoomIn, ZoomOut, BarChart3, Settings, Download, X, Sun, Moon, Menu } from 'lucide-react';
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
  const [showMore, setShowMore] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="fixed bottom-4 xs:bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom w-full max-w-[calc(100vw-1rem)] xs:max-w-none xs:w-auto px-2 xs:px-0">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="floating-panel flex items-center justify-center gap-0.5 xs:gap-1 p-1.5 xs:p-2"
      >
        {/* Primary actions - always visible */}
        <button
          onClick={onAddHabit}
          className="toolbar-button"
          title="Add Habit (A)"
          aria-label="Add habit"
        >
          <Plus className="w-4 h-4 xs:w-5 xs:h-5" />
        </button>

        <div className="w-px h-5 xs:h-6 bg-border mx-0.5 xs:mx-1 hidden xs:block" />

        <button
          onClick={onToggleErase}
          className={`toolbar-button ${isErasing ? 'active' : ''}`}
          title="Toggle Eraser (E)"
          aria-label="Toggle eraser"
          disabled={settings.noUndoMode}
        >
          <Eraser className={`w-4 h-4 xs:w-5 xs:h-5 ${settings.noUndoMode ? 'opacity-30' : ''}`} />
        </button>

        <div className="w-px h-5 xs:h-6 bg-border mx-0.5 xs:mx-1 hidden xs:block" />

        {/* Zoom controls - hidden on small mobile, show in "more" menu */}
        <div className="hidden xs:flex items-center">
          <button
            onClick={onZoomOut}
            className="toolbar-button"
            title="Zoom Out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 xs:w-5 xs:h-5" />
          </button>
          
          <span className="text-[10px] xs:text-xs text-muted-foreground w-8 xs:w-12 text-center">
            {Math.round(settings.zoom * 100)}%
          </span>
          
          <button
            onClick={onZoomIn}
            className="toolbar-button"
            title="Zoom In (+)"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 xs:w-5 xs:h-5" />
          </button>

          <div className="w-px h-5 xs:h-6 bg-border mx-0.5 xs:mx-1" />
        </div>

        {/* Secondary actions - always visible on tablet+, hidden in "more" on mobile */}
        <div className="hidden sm:flex items-center gap-0.5 xs:gap-1">
          <button
            onClick={onToggleAnalytics}
            className="toolbar-button"
            title="Analytics (D)"
            aria-label="View analytics"
          >
            <BarChart3 className="w-4 h-4 xs:w-5 xs:h-5" />
          </button>

          <button
            onClick={onExport}
            className="toolbar-button"
            title="Export"
            aria-label="Export data"
          >
            <Download className="w-4 h-4 xs:w-5 xs:h-5" />
          </button>

          <button
            onClick={toggleTheme}
            className="toolbar-button"
            title="Toggle Theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 xs:w-5 xs:h-5" />
            ) : (
              <Moon className="w-4 h-4 xs:w-5 xs:h-5" />
            )}
          </button>
        </div>

        {/* More menu button - visible on mobile */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`toolbar-button sm:hidden ${showMore ? 'active' : ''}`}
          title="More options"
          aria-label="More options"
        >
          <Menu className="w-4 h-4 xs:w-5 xs:h-5" />
        </button>

        {/* Settings button - always visible */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`toolbar-button ${showSettings ? 'active' : ''}`}
          title="Settings (S)"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 xs:w-5 xs:h-5" />
        </button>
      </motion.div>

      {/* More menu dropdown - mobile only */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="floating-panel absolute bottom-14 xs:bottom-16 left-1/2 -translate-x-1/2 p-2 sm:hidden"
          >
            <div className="flex items-center gap-1">
              {/* Zoom controls for mobile */}
              <button
                onClick={onZoomOut}
                className="toolbar-button"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-[10px] text-muted-foreground w-10 text-center">
                {Math.round(settings.zoom * 100)}%
              </span>
              
              <button
                onClick={onZoomIn}
                className="toolbar-button"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              <button
                onClick={onToggleAnalytics}
                className="toolbar-button"
                aria-label="View analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                onClick={onExport}
                className="toolbar-button"
                aria-label="Export data"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTheme}
                className="toolbar-button"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="floating-panel absolute bottom-14 xs:bottom-16 left-1/2 -translate-x-1/2 p-3 xs:p-4 w-[calc(100vw-2rem)] xs:w-64 max-w-72"
          >
            <div className="flex items-center justify-between mb-3 xs:mb-4">
              <h3 className="text-xs xs:text-sm font-semibold text-foreground">Modes</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm text-foreground">Pressure Mode</p>
                  <p className="text-[10px] xs:text-xs text-muted-foreground truncate">Missed days feel heavier</p>
                </div>
                <Switch
                  checked={settings.pressureMode}
                  onCheckedChange={(checked) => onUpdateSettings({ pressureMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm text-foreground">No-Undo Mode</p>
                  <p className="text-[10px] xs:text-xs text-muted-foreground truncate">Can't erase completed days</p>
                </div>
                <Switch
                  checked={settings.noUndoMode}
                  onCheckedChange={(checked) => onUpdateSettings({ noUndoMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs xs:text-sm text-foreground">Silent Mode</p>
                  <p className="text-[10px] xs:text-xs text-muted-foreground truncate">Hide all streaks</p>
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