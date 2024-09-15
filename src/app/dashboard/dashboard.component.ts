import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  achievements = [
    { title: 'Won a coding competition', description: 'Placed first in XYZ contest', date: '2024-08-10', tags: ['coding', 'competition'] },
    { title: 'Graduated from IT', description: 'Received my Bachelor\'s degree', date: '2024-06-01', tags: ['education', 'graduation'] }
  ];
  filteredAchievements = this.achievements;
  searchQuery = '';
  showNewAchievement = false;
  newAchievement = { title: '', description: '', date: '', tags: [] };
  availableTags = ['coding', 'graduation', 'competition'];
  selectedTag = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.searchAchievements(); // Initialize filtered list on load
  }

  // Filter achievements based on search criteria
  searchAchievements() {
    this.filteredAchievements = this.achievements.filter(achievement => {
      const matchesTag = this.selectedTag ? achievement.tags.includes(this.selectedTag) : true;
      const matchesDateRange = (this.fromDate && this.toDate) 
        ? new Date(achievement.date) >= this.fromDate && new Date(achievement.date) <= this.toDate 
        : true;
      return matchesTag && matchesDateRange;
    });
  }

  // Toggle the new achievement form
  toggleNewAchievement() {
    this.showNewAchievement = !this.showNewAchievement;
  }

  // Create a new achievement
  createAchievement() {
    if (this.newAchievement.title && this.newAchievement.description && this.newAchievement.date) {
      this.achievements.push({ ...this.newAchievement });
      this.newAchievement = { title: '', description: '', date: '', tags: [] };
      this.toggleNewAchievement();
      this.searchAchievements(); // Update search results after adding new achievement
    }
  }

  // Logout logic
  logout() {
    this.router.navigate(['']);  // Navigate to the login page
  }
}
