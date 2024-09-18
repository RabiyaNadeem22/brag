import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AchievementService } from '../services/achievement.service'; // Adjust the path as needed
import { UserService } from '../services/user.service'; // Import UserService
import { Achievement } from '../models/achievement.model'; // Import shared interface
import jsPDF from 'jspdf';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  editorConfig = {
    height: 300,
    menubar: true,
    plugins: 'link image code lists wordcount',
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | numlist bullist',
    content_css: 'https://www.tiny.cloud/css/codepen.min.css',
    setup: (editor: any) => {
      editor.on('change', () => {
        this.newAchievement.Description = editor.getContent();
      });
    }
  };

  achievements: Achievement[] = [];
  filteredAchievements: Achievement[] = [];
  showNewAchievement = false;
  newAchievement: Achievement = { Id: 0, Title: '', Description: '', Date: '', Tag: '', UserId: 0 }; // Initialize with required fields
  availableTags: string[] = ['coding', 'graduation', 'competition', 'personal growth', 'leadership'];
  selectedTag: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  editingIndex: number | null = null;

  constructor(
    private router: Router,
    private achievementService: AchievementService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    this.loadAchievements(); // Fetch achievements on component initialization
  }

 
  loadAchievements(): void {
    const userId = this.userService.getUserId();
    if (userId !== null) {
      this.achievementService.getAchievementsByUserId(userId).subscribe({
        next: (data: Achievement[]) => {
          this.achievements = data;
          this.filteredAchievements = data;
        },
        error: (error) => {
          console.error('Error fetching achievements', error);
        }
      });
    } else {
      console.error('User ID not found');
    }
  }

  searchAchievements() {
    this.filteredAchievements = this.achievements.filter(achievement => {
      const matchesTag = this.selectedTag ? achievement.Tag === this.selectedTag : true;
      const matchesDateRange = (this.fromDate && this.toDate) 
        ? new Date(achievement.Date) >= this.fromDate && new Date(achievement.Date) <= this.toDate 
        : true;
      return matchesTag && matchesDateRange;
    });
  }

  toggleNewAchievement() {
    this.showNewAchievement = !this.showNewAchievement;
    if (!this.showNewAchievement) {
      this.newAchievement = { Id: 0, Title: '', Description: '', Date: '', Tag: '', UserId: this.userService.getUserId() || 0 }; // Reset form when closed
    }
  }

  createAchievement() {
    if (this.newAchievement.Title && this.newAchievement.Description && this.newAchievement.Date) {
      this.newAchievement.UserId = this.userService.getUserId() || 0; // Ensure UserId is set
      
      if (this.editingIndex !== null && this.editingIndex >= 0 && this.editingIndex < this.filteredAchievements.length) {
        // Update existing achievement
        this.achievementService.updateAchievement(this.newAchievement).subscribe({
          next: () => {
            if (this.editingIndex !== null && this.editingIndex >= 0) {
              this.achievements[this.editingIndex] = { ...this.newAchievement };
            }
            this.editingIndex = null; // Reset editing index
            this.loadAchievements(); // Reload achievements after update
            this.showNewAchievement = false;
          },
          error: (error) => {
            console.error('Error updating achievement', error);
          }
        });
      } else {
        // Create a new achievement
        this.achievementService.addAchievement(this.newAchievement).subscribe({
          next: (newAchievement: Achievement) => {
            this.achievements.push(newAchievement);
            this.newAchievement = { Id: 0, Title: '', Description: '', Date: '', Tag: '', UserId: this.userService.getUserId() || 0 };
            this.toggleNewAchievement();
            this.searchAchievements(); // Update search results after adding new achievement
          },
          error: (error) => {
            console.error('Error creating achievement', error);
          }
        });
      }
    }
  }

  editAchievement(index: number) {
    if (index >= 0 && index < this.filteredAchievements.length) {
      this.editingIndex = index;
      this.newAchievement = { ...this.filteredAchievements[index] }; // Populate form for editing
      this.showNewAchievement = true; // Show the form
    }
  }

  deleteAchievement(index: number) {
    if (index >= 0 && index < this.filteredAchievements.length) {
      if (confirm('Are you sure you want to delete this achievement?')) {
        const achievementId = this.filteredAchievements[index].Id;
        if (achievementId != null) {
          this.achievementService.deleteAchievement(achievementId).subscribe({
            next: () => {
              this.achievements = this.achievements.filter((_, i) => i !== index); // Remove the achievement from the list
              this.searchAchievements(); // Update search results after deletion
            },
            error: (error) => {
              console.error('Error deleting achievement', error);
            }
          });
        }
      }
    }
  }

  logout() {
    this.userService.clearUserId(); // Clear user ID on logout
    this.router.navigate(['/login']); // Navigate to login or another appropriate route
  }

  edit() {
    this.router.navigate(['/edit']);
  }

  exportAchievements() {
    const doc = new jsPDF();
  
    doc.setFontSize(22);
    doc.text('Achievements List', 14, 20);
  
    doc.setFontSize(12);
    doc.text('Title', 14, 30);
    doc.text('Description', 70, 30);
    doc.text('Date', 140, 30);
    doc.text('Tags', 180, 30);
  
    let y = 40;
    const lineHeight = 10;
  
    this.achievements.forEach(achievement => {
      doc.text(achievement.Title || '', 14, y);
      
      const descriptionLines = doc.splitTextToSize(achievement.Description || '', 70);
      doc.text(descriptionLines, 70, y);
  
      doc.text(achievement.Date || '', 140, y);
  
      const tags = achievement.Tag || '';
      const tagsLines = doc.splitTextToSize(tags, 40);
      tagsLines.forEach((line: string, index: number) => {
        doc.text(line, 180, y + (index * lineHeight));
      });
  
      y += lineHeight * Math.max(descriptionLines.length, tagsLines.length);
    });
  
    doc.save('achievements.pdf');
 
  }}