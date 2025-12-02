import { formatDistanceToNow } from "date-fns";

export const formatSafeDate = (
  dateValue: string | Date | null | undefined, 
  fallback: string = "Unknown date"
): string => {
  if (!dateValue) return fallback;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return fallback;
  }
};

export const formatSafeDateTime = (
  dateValue: string | Date | null | undefined
): string => {
  if (!dateValue) return "";
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toISOString();
  } catch (error) {
    return "";
  }
};