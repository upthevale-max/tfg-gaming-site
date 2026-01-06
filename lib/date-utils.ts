// Date utility functions for Monday calculations

export function getNextMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // If it's Monday before 10:30pm (22:30), show current Monday's bookings
  if (dayOfWeek === 1) {
    const isBeforeClubEnd = hours < 22 || (hours === 22 && minutes < 30);
    
    if (isBeforeClubEnd) {
      // Return today (current Monday)
      const currentMonday = new Date(now);
      currentMonday.setHours(0, 0, 0, 0);
      return currentMonday;
    } else {
      // After 10:30pm, show next Monday (7 days away)
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + 7);
      nextMonday.setHours(0, 0, 0, 0);
      return nextMonday;
    }
  }
  
  // For Tuesday-Sunday, calculate upcoming Monday
  const daysUntilMonday = (8 - dayOfWeek) % 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  return nextMonday;
}

export function isAfterMondayMidnight(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // If it's Monday (1) and past midnight
  if (dayOfWeek === 1) {
    const hours = now.getHours();
    return hours >= 0; // Any time on Monday
  }
  
  // If it's Tuesday (2) through Sunday (0), we're past Monday
  if (dayOfWeek >= 2 || dayOfWeek === 0) {
    return false; // Past Monday means bookings should be for next week
  }
  
  return false;
}

export function shouldFreezeBookings(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Only freeze bookings after the club session ends (after 10:30pm on Monday)
  // This allows last-minute modifications and admin updates during the session
  if (dayOfWeek === 1) {
    return hours > 22 || (hours === 22 && minutes >= 30);
  }
  
  return false;
}
