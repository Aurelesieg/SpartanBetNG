import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { SchoolLesson } from '../../types';
import { INITIAL_LESSONS } from '../mockData';

interface UIContextType {
  activeTab: 'dashboard' | 'analyses' | 'performance' | 'school' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'analyses' | 'performance' | 'school' | 'profile') => void;
  showFollowModal: boolean;
  setShowFollowModal: (show: boolean) => void;
  lessons: SchoolLesson[];
  toggleLessonCompleted: (lessonId: string) => void;
  completedLessonsCount: number;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const L_LESSONS = 'spartanbet_lessons';

export const UIProvider: React.FC<{ children: ReactNode; onToast: (msg: string, type?: 'success'|'error'|'info') => void; language: string }> = ({ children, onToast, language }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyses' | 'performance' | 'school' | 'profile'>('dashboard');
  const [showFollowModal, setShowFollowModal] = useState(false);

  const [lessons, setLessons] = useState<SchoolLesson[]>(() => {
    const saved = localStorage.getItem(L_LESSONS);
    if (saved) return JSON.parse(saved);
    return INITIAL_LESSONS;
  });

  useEffect(() => {
    localStorage.setItem(L_LESSONS, JSON.stringify(lessons));
  }, [lessons]);

  const toggleLessonCompleted = (lessonId: string) => {
    setLessons(prev => {
      const target = prev.find(l => l.id === lessonId);
      const isFinishing = target ? !target.isCompleted : false;

      setTimeout(() => {
        if (isFinishing) {
          onToast(
            language === 'fr'
              ? `🔥 Leçon sur la discipline apprise (+6 Discipline)`
              : `🔥 Discipline lesson learned (+6 Discipline)`,
            'success'
          );
        }
      }, 50);

      return prev.map(l => l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l);
    });
  };

  const completedLessonsCount = useMemo(() => lessons.filter(l => l.isCompleted).length, [lessons]);

  return (
    <UIContext.Provider value={{
      activeTab,
      setActiveTab,
      showFollowModal,
      setShowFollowModal,
      lessons,
      toggleLessonCompleted,
      completedLessonsCount
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
