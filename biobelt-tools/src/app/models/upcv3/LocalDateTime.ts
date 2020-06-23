export class LocalDateTime {
    year: number = 1970;
    dayOfYear: number = 1;
  
    month: string = 'JANUARY';
    monthValue: number = 1;
    dayOfMonth: number = 1;
  
    dayOfWeek: string = 'MONDAY';
  
    hour: number = 0;
    minute: number = 0;
    second: number = 0;
    nano: number = 0;
  
    get daysFromNow(): number {
      return Math.round((new Date().getTime() - new Date(this.year, this.monthValue - 1, this.dayOfMonth, this.hour, this.minute, this.second).getTime()) / (1000 * 60 * 60 * 24));
    }
  
    get hoursFromNow(): number {
      return Math.round((new Date().getTime() - new Date(this.year, this.monthValue - 1, this.dayOfMonth, this.hour, this.minute, this.second).getTime()) / (1000 * 60 * 60));
    }
  
    get minutesFromNow(): number {
      return Math.round((new Date().getTime() - new Date(this.year, this.monthValue - 1, this.dayOfMonth, this.hour, this.minute, this.second).getTime()) / (1000 * 60));
    }
  
    static loadFromJSON(json): LocalDateTime {
      return Object.assign(new LocalDateTime, json)
    }
  
    get date(): Date {
      return new Date(this.year, this.monthValue - 1, this.dayOfMonth);
    }
  
    isBefore(date: LocalDateTime): boolean {
      return new Date(this.year, this.monthValue - 1, this.dayOfMonth) <= new Date(date.year, date.monthValue - 1, date.dayOfMonth);
    }
  
    isAfter(date: LocalDateTime): boolean {
      return new Date(this.year, this.monthValue - 1, this.dayOfMonth) >= new Date(date.year, date.monthValue - 1, date.dayOfMonth);
    }
  
    isEqual(date: LocalDateTime): boolean {
      return new Date(this.year, this.monthValue - 1, this.dayOfMonth) == new Date(date.year, date.monthValue - 1, date.dayOfMonth);
    }
  
    toLocaleString(): string {
      return new Date(this.year, this.monthValue - 1, this.dayOfMonth, this.hour, this.minute, this.second).toLocaleString();
    }
  
    toLocaleDateString(): string {
      return new Date(this.year, this.monthValue - 1, this.dayOfMonth).toLocaleDateString();
    }
  
    static getLastDayOfMonth(year: number, month: number): number {
      return new Date(year, month, 0).getDate();
    }
  }