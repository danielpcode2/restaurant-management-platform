import * as dayjs from 'dayjs';
dayjs().format();

type Table = {
  numSeats: number;
  numTable: number;
  restaurantId: string;
};

type Booking = {
  table: number;
  bookingTime: string;
};

export const getAllHoursOfDay = (dateString: string): string[] => {
  const date = dayjs(dateString);
  const hours: string[] = [];

  for (let i = 9; i < 23; i++) {
    hours.push(date.hour(i).format('HH:00'));
  }

  return hours;
};

export const getAvailableHours = (
  dateString: string,
  bookings: Booking[],
): string[] => {
  const date = dayjs(dateString);
  const hours: string[] = [];

  for (let i = 9; i <= 23; i++) {
    hours.push(date.hour(i).format('HH:00'));
  }

  const bookedTimes = bookings.map((booking) => booking.bookingTime);
  const availableHours = hours.filter((hour) => !bookedTimes.includes(hour));

  return availableHours;
};

export const getAvailableTable = (
  tables: Table[],
  bookings: Booking[],
  minSeats: number,
): number => {
  const bookedTables = new Set(bookings.map((booking) => booking.table));

  const availableTables = tables
    .filter(
      (table) =>
        table.numSeats >= minSeats && !bookedTables.has(table.numTable),
    )
    .sort((a, b) => a.numTable - b.numTable);

  if (availableTables.length === 0) {
    return null;
  }

  return availableTables[0].numTable;
};

export const filterUnavailableTimes = (
  tables: Table[],
  timeNotAvailable: Booking[],
  minSeats: number,
): Booking[] => {
  return timeNotAvailable.filter((booking) => {
    const availableTable = tables.find(
      (table) =>
        table.numSeats > minSeats &&
        !timeNotAvailable.some(
          (unavailable) => unavailable.table === table.numTable,
        ),
    );
    return !availableTable;
  });
};
