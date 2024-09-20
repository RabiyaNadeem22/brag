export interface Achievement {
  Id: number;
  Title: string;
  Description: string;
  Date: Date | null; // Allow Date or null
  Tag: string;
  UserId: number;
}


  export interface FilteredAchievement {
    Id: number;
    Title: string;
    Description: string;
    Date: string; // Consider using Date if you're working with Date objects
    Tag: string;
  }