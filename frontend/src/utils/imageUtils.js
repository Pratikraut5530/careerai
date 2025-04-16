// src/utils/imageUtils.js

export const imageReplacements = {
    // General UI Images
    "hero-image": "https://img.freepik.com/free-vector/career-growth-composition-with-flat-design_23-2147876097.jpg",
    
    // Company Logos
    "Google": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
    "Amazon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
    "Facebook": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/F_icon.svg/2048px-F_icon.svg.png",
    "Apple": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png",
    "Netflix": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png",
    "TechCorp": "https://www.freepik.com/free-photo/html-css-collage-concept-with-person_36295457.htm#fromView=search&page=1&position=6&uuid=5084ea31-348f-4077-9e4e-0e5df8329d77&query=techcorp",
    "DataWorks": "https://st2.depositphotos.com/1768926/9399/v/450/depositphotos_93999448-stock-illustration-data-tech-logo-design.jpg",
    "WebSolutions": "https://img.freepik.com/premium-vector/web-technology-logo-design-vector-template_193274-339.jpg", 
    "DesignFirst": "https://img.freepik.com/premium-vector/abstract-colorful-gradient-logo-design-template_120229-420.jpg",
    "Infosys": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Infosys_logo.svg/1280px-Infosys_logo.svg.png",
    "TCS": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/1200px-Tata_Consultancy_Services_Logo.svg.png",
    "Wipro": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/1200px-Wipro_Primary_Logo_Color_RGB.svg.png",
    
    // Course Thumbnails
    "Web Development": "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg",
    "Data Science": "https://img.freepik.com/free-vector/big-data-analytics-abstract-concept-illustration_335657-4819.jpg",
    "Machine Learning": "https://img.freepik.com/free-vector/artificial-intelligence-concept-illustration_114360-7096.jpg",
    "Programming": "https://img.freepik.com/free-vector/gradient-coding-logo-template_23-2148809439.jpg",
    "Mobile Development": "https://img.freepik.com/free-vector/gradient-mobile-interface_23-2149429409.jpg",
    "DevOps": "https://img.freepik.com/free-vector/devops-team-abstract-concept-illustration_335657-3765.jpg",
    
    // User Avatars
    "profile1": "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg",
    "profile2": "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg",
    "profile3": "https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg",
    "profile4": "https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-crossed-chest_176420-18743.jpg",
    "profile5": "https://img.freepik.com/free-photo/young-beautiful-woman-smart-casual-wear-glasses-holding-digital-tablet-looking-camera-smiling-standing-white-background_141793-25084.jpg",
    
    // Testimonials
    "testimonial1": "https://img.freepik.com/free-photo/young-woman-with-round-glasses-yellow-sweater_273609-7091.jpg",
    "testimonial2": "https://img.freepik.com/free-photo/cheerful-curly-business-girl-wearing-glasses_176420-206.jpg",
    
    // Resume images
    "resume": "https://img.freepik.com/free-vector/resume-concept-illustration_114360-370.jpg",
    "resume-analysis": "https://img.freepik.com/free-vector/hr-management-small-people-looking-resume-magnifier-analyzing-candidates-job-isolated-flat-vector-illustration_613284-2278.jpg"
  };
  
  // Helper function to get image URL based on context
  export const getImageUrl = (type, name) => {
    // For company logos
    if (type === 'company') {
      return imageReplacements[name] || "https://via.placeholder.com/80?text=Company";
    }
    
    // For course thumbnails
    if (type === 'course') {
      return imageReplacements[name] || "https://via.placeholder.com/300x200?text=Course";
    }
    
    // For user avatars
    if (type === 'avatar') {
      // Randomly select a profile image if not specified
      if (!name) {
        const profiles = ['profile1', 'profile2', 'profile3', 'profile4', 'profile5'];
        const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
        return imageReplacements[randomProfile] || "https://via.placeholder.com/150?text=Avatar";
      }
      return imageReplacements[name] || "https://via.placeholder.com/150?text=Avatar";
    }
    
    // For testimonial authors
    if (type === 'testimonial') {
      return imageReplacements[name] || "https://via.placeholder.com/150?text=Person";
    }
    
    // For general images
    if (type === 'general') {
      return imageReplacements[name] || "https://via.placeholder.com/300?text=Image";
    }
    
    // Default case
    return imageReplacements[name] || "https://via.placeholder.com/300?text=Image";
  };