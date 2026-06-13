import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
function parseYmd(v?: string): Date | null {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

interface DatePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  /** Earliest selectable date. Defaults to tomorrow (deadlines must be future). */
  minDate?: Date;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Dependency-free calendar date picker (works on web + native). Stores the
 * value as a YYYY-MM-DD string. Past/min-blocked days are disabled.
 */
export function DatePicker({
  label, value, onChange, placeholder = "Select a date", error, minDate, icon = "calendar-outline",
}: DatePickerProps) {
  const today = startOfDay(new Date());
  const min = minDate
    ? startOfDay(minDate)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const selected = parseYmd(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? min;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  // Don't allow paging earlier than the min date's month.
  const canPrev =
    year > min.getFullYear() || (year === min.getFullYear() && month > min.getMonth());

  const display = selected
    ? `${selected.getDate()} ${MONTHS[selected.getMonth()].slice(0, 3)} ${selected.getFullYear()}`
    : placeholder;

  const select = (day: number) => {
    onChange(toYmd(new Date(year, month, day)));
    setOpen(false);
  };

  return (
    <View className="mb-4">
      {label && <Text className="mb-1.5 text-sm font-medium text-ink">{label}</Text>}
      <TouchableOpacity
        className={`flex-row items-center rounded-xl border bg-surface px-4 py-3.5 min-h-[52px] ${error ? "border-danger" : "border-border"}`}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Ionicons name={icon} size={20} color={colors.ink.muted} style={{ marginRight: 10 }} />
        <Text className={`flex-1 text-base ${selected ? "text-ink" : "text-ink-muted"}`}>
          {display}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.ink.muted} />
      </TouchableOpacity>
      {error ? <Text className="mt-1.5 text-xs text-danger">{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={() => setOpen(false)}>
          <View className="mt-auto rounded-t-3xl bg-white px-4 pb-8 pt-3">
            <View className="mb-2 h-1.5 w-12 self-center rounded-full bg-border" />

            {/* Month nav */}
            <View className="mb-3 flex-row items-center justify-between px-1">
              <TouchableOpacity
                disabled={!canPrev}
                onPress={() => setView(new Date(year, month - 1, 1))}
                hitSlop={8}
                className={canPrev ? "" : "opacity-30"}
              >
                <Ionicons name="chevron-back" size={24} color={colors.ink.DEFAULT} />
              </TouchableOpacity>
              <Text className="text-base font-semibold text-ink">
                {MONTHS[month]} {year}
              </Text>
              <TouchableOpacity onPress={() => setView(new Date(year, month + 1, 1))} hitSlop={8}>
                <Ionicons name="chevron-forward" size={24} color={colors.ink.DEFAULT} />
              </TouchableOpacity>
            </View>

            {/* Weekday header */}
            <View className="flex-row">
              {WEEKDAYS.map((w) => (
                <Text key={w} className="flex-1 text-center text-xs font-medium text-ink-muted">
                  {w}
                </Text>
              ))}
            </View>

            {/* Day grid */}
            {rows.map((row, ri) => (
              <View key={ri} className="flex-row">
                {row.map((day, ci) => {
                  if (day === null) return <View key={ci} className="flex-1 aspect-square" />;
                  const date = new Date(year, month, day);
                  const disabled = startOfDay(date) < min;
                  const isSelected = selected && toYmd(date) === toYmd(selected);
                  return (
                    <TouchableOpacity
                      key={ci}
                      disabled={disabled}
                      onPress={() => select(day)}
                      className="flex-1 aspect-square items-center justify-center"
                    >
                      <View
                        className={`h-9 w-9 items-center justify-center rounded-full ${isSelected ? "bg-primary" : ""}`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? "font-bold text-white" : disabled ? "text-ink-muted/40" : "text-ink"
                          }`}
                        >
                          {day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
