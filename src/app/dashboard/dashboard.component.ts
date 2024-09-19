import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AchievementService } from '../services/achievement.service';
import { UserService } from '../services/user.service';
import { Achievement } from '../models/achievement.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
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
  newAchievement: Achievement = { Id: 0, Title: '', Description: '', Date: '', Tag: '', UserId: 0 };
  availableTags: string[] = ['coding', 'graduation', 'competition', 'personal growth', 'leadership'];
  selectedTag: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  editingIndex: number | null = null;

  constructor(
    private router: Router,
    private achievementService: AchievementService,
    private userService: UserService ,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAchievements(); 
  }

  loadAchievements(): void {
    const userId = this.userService.getUserId();
    console.log('Current User ID:', userId);
  
    if (userId !== null) {
      this.achievementService.getAchievementsByUserId(userId).subscribe({
        next: (data: Achievement[]) => {
          console.log('Achievements fetched:', data);
          this.achievements = data;
          this.filteredAchievements = [...data];
          this.cdr.detectChanges();
          console.log('Filtered achievements:', this.filteredAchievements);
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
    console.log('Filtered achievements after search:', this.filteredAchievements); // Log the filtered results
  }

  toggleNewAchievement() {
    this.showNewAchievement = !this.showNewAchievement;
    if (!this.showNewAchievement) {
      this.newAchievement = { Id: 0, Title: '', Description: '', Date: '', Tag: '', UserId: this.userService.getUserId() || 0 };
    }
  }
  createAchievement() {
    if (this.newAchievement.Title && this.newAchievement.Description && this.newAchievement.Date) {
      const tagsString = this.selectedTag || ''; // Use selected tag or empty string if not set
      const userId = this.userService.getUserId() || 0;
  
      const achievementToCreate: Achievement = {
        ...this.newAchievement,
        Tag: tagsString, // Assign the selected tag as a string
        UserId: userId
      };
  
      this.achievementService.addAchievement(achievementToCreate, userId).subscribe({
        next: (newAchievement: Achievement) => {
          this.achievements.push(newAchievement);
          this.resetNewAchievementForm();
          this.toggleNewAchievement();
          this.searchAchievements();
        },
        error: (error) => {
          console.error('Error creating achievement', error);
        }
      });
    } else {
      console.error('Validation failed: Title, Description, and Date are required');
    }
  }
  
  
  resetNewAchievementForm() {
    this.newAchievement = {
      Id: 0,
      Title: '',
      Description: '',
      Date: '',
      Tag: '', // Reset as a string
      UserId: this.userService.getUserId() || 0 
    };
    this.selectedTag = ''; // Reset selected tag
  }
  saveAchievement() {
    if (this.newAchievement.Title && this.newAchievement.Description && this.newAchievement.Date) {
      this.newAchievement.UserId = this.userService.getUserId() || 0; // Ensure UserId is set
      
      // Update existing achievement logic...
    }
  }
  updateAchievement(achievement: Achievement) {
    if (achievement.Title && achievement.Description && achievement.Date) {
        achievement.UserId = this.userService.getUserId() || 0; // Ensure UserId is set
  
        this.achievementService.updateAchievement(achievement).subscribe({
            next: () => {
                // Update the local list of achievements
                const index = this.filteredAchievements.findIndex(a => a.Id === achievement.Id);
                if (index !== -1) {
                    this.filteredAchievements[index] = { ...achievement };
                }
                this.resetNewAchievementForm();
                this.toggleNewAchievement();
                this.searchAchievements();
            },
            error: (error) => {
                console.error('Error updating achievement', error);
            }
        });
    } else {
        console.error('Validation failed: Title, Description, and Date are required');
    }
  }
  ngAfterViewChecked(): void {
    console.log('View checked. Current filteredAchievements:', this.filteredAchievements);
  }
  

 // In your dashboard.component.ts
deleteAchievement(achievementId: number) {
  this.achievementService.deleteAchievement(achievementId).subscribe({
      next: () => {
          console.log('Achievement deleted successfully');
          // Optionally refresh your achievements list here
      },
      error: (err) => {
          console.error('Error deleting achievement', err);
      }
  });
}

  edit() {
    this.router.navigate(['/edit']);
  }

  logout() {
    this.userService.clearUserId(); 
    this.router.navigate(['/login']); 
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
  }
}
