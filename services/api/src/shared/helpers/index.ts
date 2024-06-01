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

export const getAllHours = () => {
  const hours = [];
  for (let hour = 9; hour <= 23; hour++) {
    hours.push(dayjs().hour(hour).minute(0).format('HH:mm'));
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

export const filterUnavailableTimes = (
  tables: Table[],
  timeNotAvailable: Booking[],
  minSeats: number,
): string[] => {
  const hours = getAllHours();
  const availability = [];

  tables.forEach((table) => {
    if (table.numSeats >= minSeats) {
      const unavailableHours = timeNotAvailable
        .filter((booking) => booking.table === table.numTable)
        .map((booking) => booking.bookingTime);

      const availableHours = hours.filter(
        (hour) => !unavailableHours.includes(hour),
      );

      availability.push({
        table: table.numTable,
        availableHours: availableHours,
      });
    }
  });

  const allAvailableHours = availability.reduce((allHours, item) => {
    allHours.push(...item.availableHours);
    return allHours;
  }, []);

  const uniqueAvailableHours = [...new Set(allAvailableHours)].sort();

  return uniqueAvailableHours as string[];
};

export const isAnyTableAvailable = (
  tables: Table[],
  timeNotAvailable: Booking[],
  checkTime: string,
): Table[] => {
  return tables.filter((table) => {
    const isReserved = timeNotAvailable.some(
      (booking) =>
        booking.table === table.numTable && booking.bookingTime === checkTime,
    );
    return !isReserved;
  });
};
