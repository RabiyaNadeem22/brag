import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Define TinyMCE editor options here
editorConfig = {
  height: 300,
  menubar: true,
  plugins: 'link image code lists wordcount',
  toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | numlist bullist',
  content_css: 'https://www.tiny.cloud/css/codepen.min.css',
  setup: (editor: any) => {
    editor.on('change', () => {
      this.newAchievement.description = editor.getContent();
    });
  }
};
  achievements = [
    { title: 'Won a coding competition', description: 'Placed first in XYZ contest', date: '2024-08-10', tags: ['coding', 'competition'] },
    { title: 'Graduated from IT', description: 'Received my Bachelor\'s degree', date: '2024-06-01', tags: ['education', 'graduation'] }
  ];
  filteredAchievements = this.achievements;
  searchQuery = '';
  showNewAchievement = false;
  newAchievement = { title: '', description: '', date: '', tags: [] };
  availableTags = ['coding', 'graduation', 'competition','personal growth','leadership'];
  selectedTag = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  ngOnInit(): void {
    this.searchAchievements(); // Initialize filtered list on load
  }

  searchAchievements() {
    this.filteredAchievements = this.achievements.filter(achievement => {
      const matchesTag = this.selectedTag ? achievement.tags.includes(this.selectedTag) : true;
      const matchesDateRange = (this.fromDate && this.toDate) 
        ? new Date(achievement.date) >= this.fromDate && new Date(achievement.date) <= this.toDate 
        : true;
      return matchesTag && matchesDateRange;
    });
  }

  toggleNewAchievement() {
    this.showNewAchievement = !this.showNewAchievement;
  }

  createAchievement() {
    if (this.newAchievement.title && this.newAchievement.description && this.newAchievement.date) {
      this.achievements.push({ ...this.newAchievement });
      this.newAchievement = { title: '', description: '', date: '', tags: [] };
      this.toggleNewAchievement();
      this.searchAchievements(); // Update search results after adding new achievement
    }
  }
  constructor(private router: Router) {}
  logout() {
    // Implement your logout logic here
    this.router.navigate(['/login']); // Navigate to login or another appropriate route
  }

  edit() {
    this.router.navigate(['/edit']);
    }
}
