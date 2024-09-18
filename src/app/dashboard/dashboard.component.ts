import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
// Define an interface for achievements
interface Achievement {
  title: string;
  description: string;
  date: string;
  tags: string[];
}

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

  // Use the Achievement interface for type safety
  achievements: Achievement[] = [
    { title: 'Won a coding competition', description: 'Placed first in XYZ contest', date: '2024-08-10', tags: ['coding', 'competition'] },
    { title: 'Graduated from IT', description: 'Received my Bachelor\'s degree', date: '2024-06-01', tags: ['education', 'graduation'] }
  ];

  filteredAchievements: Achievement[] = this.achievements;
  showNewAchievement = false;
  newAchievement: Achievement = { title: '', description: '', date: '', tags: [] };
  availableTags: string[] = ['coding', 'graduation', 'competition', 'personal growth', 'leadership'];
  selectedTag: string = '';
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
    if (!this.showNewAchievement) {
      this.newAchievement = { title: '', description: '', date: '', tags: [] }; // Reset form when closed
    }
  }

  createAchievement() {
    if (this.newAchievement.title && this.newAchievement.description && this.newAchievement.date) {
      if (this.editingIndex !== null) {
        // Update existing achievement
        this.achievements[this.editingIndex] = { ...this.newAchievement };
        this.editingIndex = null; // Reset editing index
      } else {
        // Create a new achievement
        this.achievements.push({ ...this.newAchievement });
      }
      this.newAchievement = { title: '', description: '', date: '', tags: [] };
      this.toggleNewAchievement();
      this.searchAchievements(); // Update search results after adding new achievement
    }
  }

  // Edit Achievement
  editingIndex: number | null = null;
  editAchievement(index: number) {
    this.editingIndex = index;
    this.newAchievement = { ...this.filteredAchievements[index] }; // Populate form for editing
    this.showNewAchievement = true; // Show the form
  }

  // Delete Achievement
  deleteAchievement(index: number) {
    if (confirm('Are you sure you want to delete this achievement?')) {
      this.achievements.splice(index, 1); // Remove the achievement from the list
      this.searchAchievements(); // Update search results after deletion
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

  exportAchievements() {
    const doc = new jsPDF();
  
    // Add title
    doc.setFontSize(22);
    doc.text('Achievements List', 14, 20);
  
    // Add headers
    doc.setFontSize(12);
    doc.text('Title', 14, 30);
    doc.text('Description', 70, 30);
    doc.text('Date', 140, 30);
    doc.text('Tags', 180, 30);
  
    // Add achievements
    let y = 40; // Starting y position for achievements
    const lineHeight = 10; // Space between lines
  
    this.achievements.forEach(achievement => {
      // Title
      doc.text(achievement.title, 14, y);
      
      // Description
      const descriptionLines = doc.splitTextToSize(achievement.description, 70);
      doc.text(descriptionLines, 70, y);
  
      // Date
      doc.text(achievement.date, 140, y);
  
      // Tags
      const tags = achievement.tags.join(', ');
      const tagsLines = doc.splitTextToSize(tags, 40); // Adjust width for tags
      tagsLines.forEach((line:string, index:number) => {
        doc.text(line, 180, y + (index * lineHeight)); // Adjust position for each line of tags
      });
  
      y += lineHeight; // Move down for the next achievement
    });
  
    // Save the PDF
    doc.save('achievements.pdf');
  }
  
}
