import React, { useState, useRef, useEffect } from 'react';
import { JournalState, JournalPage } from '@/types/world';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface JournalWorldProps {
  journalState: JournalState;
  onUpdateJournal: (updates: Partial<JournalState>) => void;
}

const JournalWorld: React.FC<JournalWorldProps> = ({ journalState, onUpdateJournal }) => {
  const [currentContent, setCurrentContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const currentPage = journalState.pages[journalState.currentPage];

  useEffect(() => {
    if (currentPage) {
      setCurrentContent(currentPage.content);
    } else {
      setCurrentContent('');
    }
  }, [currentPage]);

  const handleAddPage = () => {
    const newPage: JournalPage = {
      id: crypto.randomUUID(),
      content: '',
      drawings: [],
      createdAt: Date.now(),
      period: format(new Date(), 'MMMM yyyy'),
    };
    
    onUpdateJournal({
      pages: [...journalState.pages, newPage],
      currentPage: journalState.pages.length,
    });
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    // Save current content first
    if (currentPage && currentContent !== currentPage.content) {
      const updatedPages = [...journalState.pages];
      updatedPages[journalState.currentPage] = { ...currentPage, content: currentContent };
      onUpdateJournal({ pages: updatedPages });
    }
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, journalState.currentPage - 1)
      : Math.min(journalState.pages.length - 1, journalState.currentPage + 1);
    
    onUpdateJournal({ currentPage: newIndex });
  };

  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    
    // Debounced save
    if (currentPage) {
      const updatedPages = [...journalState.pages];
      updatedPages[journalState.currentPage] = { ...currentPage, content };
      onUpdateJournal({ pages: updatedPages });
    }
  };

  const hasPrev = journalState.currentPage > 0;
  const hasNext = journalState.currentPage < journalState.pages.length - 1;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Book container */}
      <div className="relative">
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-secondary to-transparent rounded-l-lg" />
        
        <div className="floating-panel p-0 overflow-hidden ml-2">
          {/* Header */}
          <div className="p-6 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Journal</h2>
                <p className="text-xs text-muted-foreground">
                  {currentPage ? currentPage.period || 'Personal notes' : 'Your private space'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleAddPage}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Page content */}
          <AnimatePresence mode="wait">
            {journalState.pages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <p className="text-muted-foreground mb-4">Your journal is empty.</p>
                <button
                  onClick={handleAddPage}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm transition-colors"
                >
                  Create first page
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={journalState.currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {/* Writing area */}
                <textarea
                  ref={textareaRef}
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Write freely... This space is yours."
                  className="w-full h-[400px] bg-transparent text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none text-sm leading-relaxed"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, hsl(var(--border) / 0.3) 27px, hsl(var(--border) / 0.3) 28px)',
                    lineHeight: '28px',
                    paddingTop: '0',
                  }}
                />
                
                {/* Page date */}
                {currentPage && (
                  <p className="text-xs text-muted-foreground/50 mt-4 text-right">
                    {format(new Date(currentPage.createdAt), 'MMMM d, yyyy')}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page navigation */}
          {journalState.pages.length > 0 && (
            <div className="p-4 border-t border-border/30 flex items-center justify-between">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={!hasPrev}
                className={`p-2 rounded-lg transition-colors ${hasPrev ? 'hover:bg-secondary text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs text-muted-foreground">
                Page {journalState.currentPage + 1} of {journalState.pages.length}
              </span>
              
              <button
                onClick={() => handlePageChange('next')}
                disabled={!hasNext}
                className={`p-2 rounded-lg transition-colors ${hasNext ? 'hover:bg-secondary text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* No metrics reminder */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground/40 mt-6 italic"
      >
        No analytics. No metrics. Just you.
      </motion.p>
    </motion.div>
  );
};

export default JournalWorld;
