export class DiffCo2Program {
    daysCode: DaysCode = 7;
      start: string = "00:00:00";
      end: string = "00:00:00";
    intensity: number = 0;
    
    static loadFromJSON(json): DiffCo2Program {
      return Object.assign(new DiffCo2Program, json)
    }
  }
  
  export enum DaysCode {
    'Sunday' = 0,
    'Monday' = 1,
    'Tuesday' = 2,
    'Wednesday' = 3,
    'Thursday' = 4,
    'Friday' = 5,
    'Saturday' = 6,
    'All week' = 7,
    'Weekend' = 8,
    'Midweek' = 9
  }
  
  export const intensities: any[] = [
    { name: 'Désactivée', value: 0 },
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
    { name: '6', value: 6 },
    { name: '7', value: 7 },
    { name: '8', value: 8 },
    { name: '9', value: 9 },
    { name: '10', value: 10 }
  ];
  
  export const daysCodes: any[] = [
    { name: 'Tous les jours', value: DaysCode['All week'] },
    { name: 'Semaine', value: DaysCode['Midweek'] },
    { name: 'Weekend', value: DaysCode['Weekend'] },
    { name: 'Lundi', value: DaysCode['Monday'] },
    { name: 'Mardi', value: DaysCode['Tuesday'] },
    { name: 'Mercredi', value: DaysCode['Wednesday'] },
    { name: 'Jeudi', value: DaysCode['Thursday'] },
    { name: 'Vendredi', value: DaysCode['Friday'] },
    { name: 'Samedi', value: DaysCode['Saturday'] },
    { name: 'Dimanche', value: DaysCode['Sunday'] }
  ];