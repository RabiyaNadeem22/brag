export interface Achievement {
    Id: number;
    Title: string;
    Description: string;
    Date: string;
    Tag: string;
    UserId: number; // Adjust if necessary
  }

  export interface FilteredAchievement {
    Id: number;
    Title: string;
    Description: string;
    Date: string; // Consider using Date if you're working with Date objects
    Tag: string;
  }