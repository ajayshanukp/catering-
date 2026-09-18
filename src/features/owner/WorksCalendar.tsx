import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO 
} from 'date-fns';

export const WorksCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    const load = () => setWorks(workforceService.getWorks());
    load();
    const unsub = workforceService.subscribe(load);
    return unsub;
  }, []);

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayWorks = works.filter(w => w.workDate === selectedDateStr && w.status !== 'cancelled');

  const handlePrevWeek = () => {
    const newStart = subDays(currentWeekStart, 7);
    setCurrentWeekStart(newStart);
    setSelectedDate(newStart);
  };

  const handleNextWeek = () => {
    const newStart = addDays(currentWeekStart, 7);
    setCurrentWeekStart(newStart);
    setSelectedDate(newStart);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
    setSelectedDate(now);
  };

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Works Calendar</h2>
          <p className="text-xs text-text-muted mt-0.5">Visual schedule of catering assignments by date</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/owner/works')}
            icon={<List className="w-4 h-4" />}
          >
            List View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/owner/works/new')}
          >
            Add Work
          </Button>
        </div>
      </div>

      {/* Week Navigation Header */}
      <Card padding="sm" className="mb-6 shadow-subtle">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-strong">
              {format(currentWeekStart, 'MMMM yyyy')}
            </h3>
            <span className="text-xs text-text-muted hidden sm:inline">
              (Week of {format(currentWeekStart, 'd MMM')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM')})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 rounded-control hover:bg-slate-100 text-text-muted hover:text-text-strong"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 rounded-control hover:bg-slate-100 text-text-muted hover:text-text-strong"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 7-Day Strip */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-3 pt-3 border-t border-border">
          {weekDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const count = works.filter(w => w.workDate === dayStr && w.status !== 'cancelled').length;

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-2 sm:py-3 rounded-control transition-all ${
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-subtle'
                    : isToday
                    ? 'bg-teal-50 text-primary border border-teal-200'
                    : 'bg-white hover:bg-slate-50 text-text-strong border border-border'
                }`}
              >
                <span className={`text-[10px] sm:text-xs uppercase font-medium ${isSelected ? 'text-teal-100' : 'text-text-muted'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className="text-sm sm:text-base font-bold my-0.5">
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold mt-1 ${
                    isSelected ? 'bg-white text-primary' : 'bg-primary/10 text-primary'
                  }`}>
                    {count} event{count > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Agenda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-strong uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span>Events for {format(selectedDate, 'EEEE, d MMMM yyyy')}</span>
          </h4>
          <span className="text-xs text-text-muted font-medium">
            {selectedDayWorks.length} Work{selectedDayWorks.length === 1 ? '' : 's'}
          </span>
        </div>

        {selectedDayWorks.length === 0 ? (
          <Card padding="lg" className="text-center py-10">
            <p className="text-sm text-text-muted mb-3">No catering events scheduled for this date.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/owner/works/new')}
            >
              Schedule Work on this Day
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDayWorks.map((work) => (
              <Card
                key={work.id}
                variant="interactive"
                padding="md"
                onClick={() => navigate(`/owner/works/${work.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-sm font-bold text-text-strong">{work.name}</h5>
                  <StatusBadge status={work.status} />
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-3">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Reporting Time: <strong>{work.reportingTime}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{work.sitePlace}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Site Captain: <strong>{work.mainSiteCaptainName || 'Unassigned'}</strong>
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                    {work.totalFilled} / {work.totalRequired}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
