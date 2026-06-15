import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { SchoolLesson } from '../../types';
import { 
  GraduationCap, BookOpen, CheckCircle, Clock, 
  ChevronRight, Dumbbell, ShieldCheck, PlayCircle, Award
} from 'lucide-react';
import { motion } from 'motion/react';

export const SpartanSchool: React.FC = () => {
  const { user, lessons, toggleLessonCompleted } = useApp();

  const isFr = user.language === 'fr';

  const [activeLesson, setActiveLesson] = useState<SchoolLesson | null>(() => {
    return lessons[0] || null;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Gestion': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Mental': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Débutant': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Intermédiaire': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-stone-500/10 text-neutral-400 border-white/5';
    }
  };

  const completedCount = lessons.filter(l => l.isCompleted).length;
  const progressionPercent = Math.round((completedCount * 100) / lessons.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      
      {/* 1. Header & Quick stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131316] p-5 rounded-2xl border border-white/5 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold uppercase italic text-white font-sans tracking-tight">
            {isFr ? 'École de Discipline Spartan' : 'Spartan School of Discipline'}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-medium">
            {isFr 
              ? 'Formations exclusives pour transformer la passion sportive en rigueur d’investissement.' 
              : 'Interactive core books designed to turn emotions into calculated value streams.'}
          </p>
        </div>

        {/* Global School Progress */}
        <div className="bg-[#0A0A0B] border border-white/5 p-4 rounded-xl min-w-[200px] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-bold font-mono uppercase">{isFr ? 'PROGRESSION' : 'ACADEMY INDEX'}</span>
            <strong className="text-orange-500 font-mono">{progressionPercent}%</strong>
          </div>
          <div className="w-full bg-[#131316] h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-orange-500 h-full transition-all duration-500"
              style={{ width: `${progressionPercent}%` }}
            />
          </div>
          <span className="block text-[10px] text-neutral-500 text-center font-mono">
            {completedCount} {isFr ? 'leçons acquises' : 'books closed'} / {lessons.length} {isFr ? 'cours' : 'lessons'}
          </span>
        </div>
      </div>

      {/* 2. Main split interactive page */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left lists (4 cols) */}
        <div className="lg:col-span-5 space-y-3 order-2 lg:order-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block px-1">
            {isFr ? 'PLAN D’ÉTUDE DISPONIBLE' : 'STUDY BLUEPRINTS'}
          </span>
          <div className="flex flex-col gap-2">
            {lessons.map(lesson => {
              const isSelected = activeLesson?.id === lesson.id;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#131316] border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.1)]' 
                      : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getCategoryColor(lesson.category)}`}>
                      {lesson.category}
                    </span>
                    {lesson.isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isFr ? 'Acquis' : 'Mastered'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-stone-100 transition-colors mt-2.5 truncate">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-stone-400 line-clamp-2 mt-1 font-sans">
                    {lesson.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono mt-3">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.duration} {isFr ? 'de lecture' : 'readtime'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
               {/* Right book details (7 cols) */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          {activeLesson ? (
            <div className="bg-[#131316] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* Header */}
              <div className="space-y-2 border-b border-white/5 pb-5">
                <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getCategoryColor(activeLesson.category)}`}>
                  {activeLesson.category}
                </span>
                <h3 className="text-xl md:text-2xl font-bold uppercase italic text-white font-sans tracking-tight">
                  {activeLesson.title}
                </h3>
                <p className="text-xs text-neutral-400 font-medium">
                  {activeLesson.description}
                </p>
              </div>

              {/* Core Content paragraphs */}
              <div className="space-y-4">
                <h4 className="text-xs text-neutral-450 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  {isFr ? 'Contenu de la Leçon' : 'E-Book Reading'}
                </h4>

                <div className="space-y-4 pt-1">
                  {activeLesson.content.map((point, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 bg-[#0A0A0B] p-4 border border-white/5 rounded-xl"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-600/10 text-xs font-mono font-bold text-orange-500 shrink-0">
                        0{index + 1}
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed font-sans pt-0.5">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gamified Complete Button Action */}
              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-white">
                    {isFr ? 'Effet de Discipline' : 'Academy Score Effect'}
                  </h5>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {isFr ? 'Valider débloque +6 points d’Indice de Discipline.' : 'Reading closes credentials, raising Index by +6.'}
                  </p>
                </div>

                <button
                  id={`toggle-lesson-${activeLesson.id}`}
                  onClick={() => toggleLessonCompleted(activeLesson.id)}
                  className={`px-6 py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    activeLesson.isCompleted
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                      : 'bg-white hover:bg-stone-200 text-stone-950 shadow-md'
                  }`}
                >
                  {activeLesson.isCompleted ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Leçon Acquise ✓ (Cliquer pour relire)' : 'Mastered ✓ (Reset status)'}</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Marquer comme Lu' : 'Complete Reading'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-stone-500 font-mono">
              {isFr ? 'Sélectionnez un cours.' : 'Select a study book to read.'}
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
};
