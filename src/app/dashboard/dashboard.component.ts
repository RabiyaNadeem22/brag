declare module 'html2pdf.js';
declare module 'dompurify';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AchievementService } from '../services/achievement.service';
import { UserService } from '../services/user.service';
import { Achievement } from '../models/achievement.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

import html2pdf from 'html2pdf.js';


import DOMPurify from 'dompurify';


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
  showEditAchievement = false;
  newAchievement: Achievement = { Id: 0, Title: '', Description: '', Date: new Date, Tag: '', UserId: 0 };
  availableTags: string[] = ['coding', 'graduation', 'competition', 'personal growth', 'leadership'];
  selectedTag: string = '';
  editAchievement: Achievement = { Id: 0, Title: '', Description: '', Date: new Date, Tag: '', UserId: 0 };

  editingIndex: number | null = null;

  constructor(
    private router: Router,
    private achievementService: AchievementService,
    private userService: UserService,private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar 
  ) {}

  ngOnInit(): void {
    // Temporarily hardcoded data for testing
   
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

  // Toggle the form for editing an existing achievement
  toggleEditAchievement() {
    this.showEditAchievement = !this.showEditAchievement;
    if (!this.showEditAchievement) {
      this.editAchievement = { Id: 0, Title: '', Description: '', Date: new Date, Tag: '', UserId: this.userService.getUserId() || 0 };
    }
  }

  updateAchievement(achievement: Achievement) {
    const formattedDate = achievement.Date ? this.formatDateForInput(achievement.Date) : '';
    this.editAchievement = { ...achievement, Date: formattedDate as any }; // Temporarily assign string for the form
    this.selectedTag = achievement.Tag;
    this.toggleEditAchievement();
  }
  
  // Helper function to format the Date object into yyyy-MM-dd
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }
  
  searchTag: string = ''; // Add this variable to hold the search input
  searchAchievements(): void {
    const userId = this.userService.getUserId();
    console.log('Current User ID:', userId);
  
    if (!userId) {
      console.error('User ID not found');
      return;
    }
  
    if (this.searchTag.trim()) {
      this.achievementService.searchAchievementsByTag(userId, this.searchTag.trim()).subscribe({
        next: (data: any[]) => {
          console.log('Raw Searched Achievements:', data); // Log the raw data
  
          this.achievements = data.map(achievement => {
            console.log('Raw Achievement:', achievement); // Log each achievement for debugging
  
            const parsedDate = achievement.date ? new Date(achievement.date) : null; // Parse the date correctly
  
            return {
              Id: achievement.id, // Use lowercase from the API response
              Title: achievement.title,
              Description: achievement.description,
              Date: parsedDate,
              Tag: achievement.tag,
              UserId: achievement.userId
            };
          });
  
          console.log('Mapped Searched Achievements:', this.achievements); // Log mapped achievements
        },
        error: (error) => {
          console.error('Error searching achievements', error);
          this.snackBar.open('Error fetching achievements. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.loadAchievements(); // Reload all achievements if no search tag is provided
    }
  }
  
  
  
  

  // Save the updated achievement
  saveEditAchievement() {
    const userId = this.userService.getUserId();
  
    if (this.editAchievement.Title && this.editAchievement.Description && this.editAchievement.Date && userId) {
      // Parse the date string from the input field back to a Date object
      const achievementToUpdate: Achievement = {
        ...this.editAchievement,
        Date: this.editAchievement.Date ? new Date(this.editAchievement.Date) : null, // Convert the string back to Date
        UserId: userId
      };
  
      this.achievementService.updateAchievement(achievementToUpdate).subscribe({
        next: () => {
          const index = this.achievements.findIndex(a => a.Id === this.editAchievement.Id);
          if (index !== -1) {
            this.achievements[index] = { ...achievementToUpdate };
          }
          this.toggleEditAchievement();
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
  
    const confirmDelete = window.confirm('Are you sure you want to delete this achievement?'); 
    if (confirmDelete) {
      this.achievementService.deleteAchievement(userId, achievementId).subscribe({
          next: () => {
              console.log('Achievement deleted successfully');
              this.achievements = this.achievements.filter(a => a.Id !== achievementId);
          },
          error: (err) => {
              console.error('Error deleting achievement', err);
          }
      });
    } else {
      console.log('Deletion canceled');
    }
  }
  async exportAchievements(): Promise<void> {
    const { default: html2pdf } = await import('html2pdf.js');

    // Check if running in a browser environment
    if (typeof window === 'undefined') {
        console.error('This function can only be run in the browser.');
        return;
    }

    // Create the content for the PDF
    const content = this.achievements
        .map(achievement => {
            const formattedDate = achievement.Date ? new Date(achievement.Date).toLocaleDateString() : '';

            return `
            <div style="font-family: Arial, sans-serif; margin: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                <h1 style="font-size: 24px; color: #000;">Achievement</h1>
                <p style="font-size: 18px; color: #000;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="font-size: 18px; color: #000;"><strong>Title:</strong> ${achievement.Title}</p>
                <p style="font-size: 18px; color: #000;"><strong>Description:</strong></p>
                <div style="font-size: 16px; color: #000;">${DOMPurify.sanitize(achievement.Description)}</div>
                <p style="font-size: 18px; color: #000;"><strong>Tag:</strong> ${achievement.Tag}</p>
                <hr style="margin: 20px 0; border-top: 1px solid #eee;">
            </div>
            `;
        })
        .join('');

    const element = document.createElement('div');
    element.style.display = 'block'; 
    element.innerHTML = content;
    document.body.appendChild(element);

    try {
        await html2pdf()
            .from(element)
            .set({
                margin: 1,
                filename: 'Achievements.pdf', // Ensure this is the name you want
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            })
            .save(); // Save the PDF with the specified filename

        // Uncomment the line below if you want to auto-print after generating
        // pdf.autoPrint();
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        // Clean up the temporary element
        document.body.removeChild(element);
    }
}



  
 
// Utility function to strip HTML tags
stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}


  
  logout() {
    this.userService.clearUserId();
    this.router.navigate(['/login']);
  }
  

  edit() {
    this.router.navigate(['/edit']);
    }}