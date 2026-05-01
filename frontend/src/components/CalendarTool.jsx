import React, { useState } from "react";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../Theme";
import 'react-calendar/dist/Calendar.css';

export default function CalendarTool() {
  const { dark } = useTheme();
  const [date, setDate] = useState(new Date());

  const fg = dark ? "#E5E7EB" : "#1F2937";
  const fgMuted = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const accent = "#ef4444"; // Soft red for weekends

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarIcon size={18} color={dark ? "#fff" : "#000"} />
          </div>
          <div>
            <h3 style={{ fontSize: 10, fontWeight: 800, color: fgMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2, margin: 0 }}>Organization</h3>
            <div style={{ fontSize: 16, fontWeight: 700, color: fg }}>Zenith Calendar</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <style>{`
          .react-calendar {
            width: 100% !important;
            background: transparent !important;
            border: none !important;
            font-family: inherit !important;
            color: ${fg} !important;
          }
          .react-calendar__navigation {
            margin-bottom: 16px !important;
            display: flex !important;
            gap: 8px !important;
          }
          .react-calendar__navigation button {
            color: ${fg} !important;
            min-width: 44px !important;
            background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important;
            border: 1px solid ${border} !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            transition: all 0.2s !important;
          }
          .react-calendar__navigation button:enabled:hover {
            background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
          }
          .react-calendar__month-view__weekdays {
            font-size: 11px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            color: ${fgMuted} !important;
            padding-bottom: 8px !important;
          }
          .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none !important;
          }
          .react-calendar__month-view__weekdays__weekday:nth-child(6),
          .react-calendar__month-view__weekdays__weekday:nth-child(7) {
            color: ${accent} !important;
            opacity: 0.8 !important;
          }
          .react-calendar__tile {
            padding: 12px 6px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            border-radius: 10px !important;
            color: ${fg} !important;
            transition: all 0.2s !important;
          }
          .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
            background-color: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
            color: ${dark ? '#fff' : '#000'} !important;
          }
          .react-calendar__month-view__days__day--weekend {
            color: ${accent} !important;
          }
          .react-calendar__tile--now {
            background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} !important;
            color: ${fg} !important;
            border: 1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} !important;
            font-weight: 700 !important;
            box-shadow: 0 0 15px ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} !important;
          }
          .react-calendar__tile--active {
            background: ${dark ? '#fff' : '#000'} !important;
            color: ${dark ? '#000' : '#fff'} !important;
            box-shadow: 0 8px 20px ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} !important;
          }
          .react-calendar__month-view__days__day--neighboringMonth {
            opacity: 0.2 !important;
          }
        `}</style>
        <Calendar
          onChange={setDate}
          value={date}
          nextLabel={<ChevronRight size={16} />}
          prevLabel={<ChevronLeft size={16} />}
          next2Label={null}
          prev2Label={null}
        />
      </div>
    </div>
  );
}
