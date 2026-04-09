import React from 'react';
import { SettingsRowProps } from '../types/PlanDegreePage';

/**
 * SettingsRow Component
 * 
 * A compact horizontal card containing all semester configuration controls:
 * - Season selection pills (Fall, Spring, Summer)
 * - Year dropdown
 * - Summer toggle switch
 * - Credit hour limit pills (12-18)
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 11.7
 */
const SettingsRow: React.FC<SettingsRowProps> = ({
  selectedSeason,
  selectedYear,
  includeSummer,
  maxHoursPerSemester,
  onSeasonChange,
  onYearChange,
  onSummerToggle,
  onMaxHoursChange,
}) => {
  const seasons: Array<'Fall' | 'Spring' | 'Summer'> = ['Fall', 'Spring', 'Summer'];
  const creditHours = [12, 13, 14, 15, 16, 17, 18];
  
  // Generate year range (current year to 5 years ahead)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear + i).toString());

  return (
    <div
      className="rounded-3xl border p-6"
      style={{
        background: 'var(--s1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex flex-wrap items-center gap-6">
        {/* Season Selection */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--sub)' }}>
            Season
          </label>
          <div className="flex gap-2">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => onSeasonChange(season)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: selectedSeason === season ? 'var(--s2)' : 'transparent',
                  color: selectedSeason === season ? 'var(--text)' : 'var(--sub)',
                  border: selectedSeason === season 
                    ? '1px solid rgba(255, 255, 255, 0.15)' 
                    : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-8 w-px"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        />

        {/* Year Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--sub)' }}>
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: 'var(--s2)',
              color: 'var(--text)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div
          className="h-8 w-px"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        />

        {/* Summer Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--sub)' }}>
            Include Summer
          </label>
          <button
            onClick={onSummerToggle}
            className="relative w-12 h-6 rounded-full transition-all duration-200"
            style={{
              background: includeSummer ? 'var(--blue)' : 'var(--s2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            aria-label="Toggle summer semesters"
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
              style={{
                background: 'var(--text)',
                left: includeSummer ? 'calc(100% - 22px)' : '2px',
              }}
            />
          </button>
        </div>

        {/* Divider */}
        <div
          className="h-8 w-px"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        />

        {/* Credit Hour Limit Pills */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--sub)' }}>
            Max Hours
          </label>
          <div className="flex gap-2">
            {creditHours.map((hours) => (
              <button
                key={hours}
                onClick={() => onMaxHoursChange(hours)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: maxHoursPerSemester === hours ? 'var(--s2)' : 'transparent',
                  color: maxHoursPerSemester === hours ? 'var(--text)' : 'var(--sub)',
                  border: maxHoursPerSemester === hours
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {hours}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsRow;
