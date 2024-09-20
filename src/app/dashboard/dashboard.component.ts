import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AchievementService } from '../services/achievement.service';
import { UserService } from '../services/user.service';
import { Achievement } from '../models/achievement.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

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
  showNewAchievement = false;
  newAchievement: Achievement = { Id: 0, Title: '', Description: '', Date: new Date, Tag: '', UserId: 0 };
  availableTags: string[] = ['coding', 'graduation', 'competition', 'personal growth', 'leadership'];
  selectedTag: string = '';
  editingIndex: number | null = null;

  constructor(
    private router: Router,
    private achievementService: AchievementService,
    private userService: UserService,private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Temporarily hardcoded data for testing
    this.achievements = [
        {
            Id: 1,
            Title: 'Test Achievement',
            Description: 'This is a test description.',
            Date: new Date('2024-09-18T11:12:30.05'), // Hardcoded date
            Tag: 'testing',
            UserId: 1
        }
    ];
    this.loadAchievements();
}
loadAchievements(): void {
  const userId = this.userService.getUserId();
  console.log('Current User ID:', userId);

  if (userId !== null) {
    this.achievementService.getAchievementsByUserId(userId).subscribe({
      next: (data: any[]) => {
        console.log('Raw Achievements fetched:', data); // Log the raw data

        this.achievements = data.map(achievement => {
          console.log('Raw Achievement:', achievement); // Log each achievement for debugging

          const parsedDate = achievement.date ? new Date(achievement.date) : null; // Parse the date correctly

          return {
            Id: achievement.id,
            Title: achievement.title,
            Description: achievement.description,
            Date: parsedDate,
            Tag: achievement.tag,
            UserId: achievement.userId
          };
        });

        console.log('Mapped Achievements:', this.achievements); // Log mapped achievements
      },
      error: (error) => {
        console.error('Error fetching achievements', error);
      }
    });
  } else {
    console.error('User ID not found');
  }
}

formatDate(dateString: string): string {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
}



  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  } 

  toggleNewAchievement() {
    this.showNewAchievement = !this.showNewAchievement;
    if (!this.showNewAchievement) {
      this.newAchievement = { Id: 0, Title: '', Description: '', Date: new Date, Tag: '', UserId: this.userService.getUserId() || 0 };
    }
  }
  saveAchievement() {
    if (this.newAchievement.Title && this.newAchievement.Description && this.newAchievement.Date) {
      this.newAchievement.UserId = this.userService.getUserId() || 0; // Ensure UserId is set
      
      // Update existing achievement logic...
    }
  }
  createAchievement() {
    if (this.newAchievement.Title && this.newAchievement.Description && this.newAchievement.Date) {
        const tagsString = this.selectedTag || ''; 
        const userId = this.userService.getUserId() || 0;

        const achievementToCreate: Achievement = {
            ...this.newAchievement,
            Tag: tagsString, 
            UserId: userId
        };

        this.achievementService.addAchievement(achievementToCreate, userId).subscribe({
            next: (newAchievement: any) => {  // Use 'any' temporarily for debugging
                console.log('New Achievement Returned:', newAchievement); // Log the new achievement

                // Map it to the correct structure
                const formattedAchievement = {
                    Id: newAchievement.id, // Ensure these match your backend response
                    Title: newAchievement.title,
                    Description: newAchievement.description,
                    Date: newAchievement.date ? new Date(newAchievement.date) : null, // Correctly parse the date
                    Tag: newAchievement.tag,
                    UserId: newAchievement.userId
                };

                this.achievements.push(formattedAchievement);
                console.log('Achievements after adding new:', this.achievements); // Log achievements array

                this.resetNewAchievementForm();
                this.toggleNewAchievement();
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
      Date: new Date,
      Tag: '', 
      UserId: this.userService.getUserId() || 0 
    };
    this.selectedTag = ''; 
  }

  updateAchievement(achievement: Achievement) {
    if (achievement.Title && achievement.Description && achievement.Date) {
      achievement.UserId = this.userService.getUserId() || 0;
  
      this.achievementService.updateAchievement(achievement).subscribe({
        next: () => {
          const index = this.achievements.findIndex(a => a.Id === achievement.Id);
          if (index !== -1) {
            this.achievements[index] = { ...achievement }; // Update existing achievement
          }
          this.resetNewAchievementForm();
          this.toggleNewAchievement();
        },
        error: (error) => {
          console.error('Error updating achievement', error);
        }
      });
    } else {
      console.error('Validation failed: Title, Description, and Date are required');
    }
  }
  


  deleteAchievement(achievementId: number) {
    const userId = this.userService.getUserId(); // Get the user ID from session storage
    if (userId === null) {
        console.error('User ID is null. Cannot delete achievement.');
        return; // Exit the method early
    }
    
    this.achievementService.deleteAchievement(userId, achievementId).subscribe({
        next: () => {
            console.log('Achievement deleted successfully');
            this.achievements = this.achievements.filter(a => a.Id !== achievementId);
        },
        error: (err) => {
            console.error('Error deleting achievement', err);
        }
    });
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
        descriptionLines.forEach((line: string, index: number) => {
            doc.text(line, 70, y + (index * lineHeight));
        });

        // Format the Date property
        const formattedDate = achievement.Date ? new Date(achievement.Date).toLocaleDateString() : '';
        doc.text(formattedDate, 140, y);
        
        const tags = achievement.Tag || '';
        const tagsLines = doc.splitTextToSize(tags, 40);
        tagsLines.forEach((line: string, index: number) => {
            doc.text(line, 180, y + (index * lineHeight));
        });

        // Update the y position for the next achievement
        y += lineHeight * Math.max(descriptionLines.length, tagsLines.length);
    });

    doc.save('achievements.pdf');
}

  
  logout() {
    this.userService.clearUserId();
    this.router.navigate(['/login']);
  }
  

  edit() {
    this.router.navigate(['/edit']);
  }
}
