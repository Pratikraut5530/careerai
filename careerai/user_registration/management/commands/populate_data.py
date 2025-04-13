from django.core.management.base import BaseCommand
from user_registration.models import Location, Skill, EducationLevel, EmploymentType, WorkEnvironment, JobRole, Company

class Command(BaseCommand):
    help = 'Populates the database with initial data for locations, skills, etc.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data population...'))
        
        # Populate locations
        self.populate_locations()
        
        # Populate skills
        self.populate_skills()
        
        # Populate education levels
        self.populate_education_levels()
        
        # Populate employment types
        self.populate_employment_types()
        
        # Populate work environments
        self.populate_work_environments()
        
        # Populate job roles
        self.populate_job_roles()
        
        # Populate top companies
        self.populate_companies()
        
        self.stdout.write(self.style.SUCCESS('Data population completed successfully!'))
    
    def populate_locations(self):
        locations = [
            "Maharashtra - Mumbai",
            "Maharashtra - Pune",
            "Maharashtra - Nagpur",
            "Maharashtra - Nashik",
            "Maharashtra - Aurangabad",
            "Karnataka - Bengaluru",
            "Karnataka - Mysuru",
            "Karnataka - Mangaluru",
            "Karnataka - Hubballi-Dharwad",
            "Karnataka - Belagavi",
            "Tamil Nadu - Chennai",
            "Tamil Nadu - Coimbatore",
            "Tamil Nadu - Madurai",
            "Tamil Nadu - Tiruchirappalli",
            "Tamil Nadu - Salem",
            "Telangana - Hyderabad",
            "Telangana - Warangal",
            "Telangana - Karimnagar",
            "Telangana - Nizamabad",
            "Delhi - New Delhi",
            "Haryana - Gurugram",
            "Haryana - Faridabad",
            "Uttar Pradesh - Noida",
            "Uttar Pradesh - Ghaziabad",
            "Uttar Pradesh - Lucknow",
            "Uttar Pradesh - Kanpur",
            "Uttar Pradesh - Agra",
            "Uttar Pradesh - Varanasi",
            "Uttar Pradesh - Meerut",
            "Gujarat - Ahmedabad",
            "Gujarat - Surat",
            "Gujarat - Vadodara",
            "Gujarat - Rajkot",
            "Gujarat - Gandhinagar",
            "West Bengal - Kolkata",
            "West Bengal - Siliguri",
            "West Bengal - Durgapur",
            "West Bengal - Asansol",
            "Punjab - Chandigarh",
            "Punjab - Ludhiana",
            "Punjab - Amritsar",
            "Punjab - Jalandhar",
            "Punjab - Mohali",
            "Rajasthan - Jaipur",
            "Rajasthan - Jodhpur",
            "Rajasthan - Udaipur",
            "Rajasthan - Kota",
            "Kerala - Thiruvananthapuram",
            "Kerala - Kochi",
            "Kerala - Kozhikode",
            "Kerala - Thrissur",
            "Andhra Pradesh - Visakhapatnam",
            "Andhra Pradesh - Vijayawada",
            "Andhra Pradesh - Tirupati",
            "Andhra Pradesh - Guntur",
            "Madhya Pradesh - Indore",
            "Madhya Pradesh - Bhopal",
            "Madhya Pradesh - Jabalpur",
            "Madhya Pradesh - Gwalior",
            "Bihar - Patna",
            "Bihar - Gaya",
            "Bihar - Bhagalpur",
            "Odisha - Bhubaneswar",
            "Odisha - Cuttack",
            "Odisha - Rourkela",
            "Chhattisgarh - Raipur",
            "Chhattisgarh - Bhilai",
            "Chhattisgarh - Bilaspur",
            "Uttarakhand - Dehradun",
            "Uttarakhand - Haridwar",
            "Uttarakhand - Roorkee",
            "Jharkhand - Ranchi",
            "Jharkhand - Jamshedpur",
            "Jharkhand - Dhanbad",
            "Assam - Guwahati",
            "Assam - Silchar",
            "Assam - Dibrugarh",
            "Himachal Pradesh - Shimla",
            "Himachal Pradesh - Dharamshala",
            "Goa - Panaji",
            "Goa - Margao",
            "Goa - Vasco da Gama",
            "Manipur - Imphal",
            "Meghalaya - Shillong",
            "Tripura - Agartala",
            "Nagaland - Kohima",
            "Mizoram - Aizawl",
            "Arunachal Pradesh - Itanagar",
            "Sikkim - Gangtok",
            "Chandigarh",
            "Puducherry",
            "Jammu and Kashmir - Srinagar",
            "Jammu and Kashmir - Jammu",
            "Ladakh - Leh",
            "Remote - Within India",
            "Remote - Global",
            "Hybrid - Any Location"
        ]
        
        count = 0
        for location_name in locations:
            location, created = Location.objects.get_or_create(name=location_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} locations'))
    
    def populate_skills(self):
        skills = [
            "JavaScript", "Python", "Java", "C++", "C#", "PHP", "TypeScript", "Ruby", "Swift", "Kotlin",
            "Go", "Rust", "Scala", "R", "Dart", "HTML", "CSS", "React", "Angular", "Vue.js",
            "Redux", "jQuery", "SASS/SCSS", "Bootstrap", "Tailwind CSS", "Material UI", "Responsive Design",
            "Progressive Web Apps", "Next.js", "Gatsby", "Node.js", "Express.js", "Django", "Flask", "Spring Boot",
            "Laravel", "ASP.NET", "Ruby on Rails", "FastAPI", "GraphQL", "REST API", "Microservices",
            "Serverless Architecture", "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
            "Oracle", "Microsoft SQL Server", "Cassandra", "Firebase", "DynamoDB", "Neo4j", "Database Design",
            "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "Ansible",
            "Linux", "Bash Scripting", "Git", "GitHub", "GitLab", "Infrastructure as Code", "Android Development",
            "iOS Development", "React Native", "Flutter", "Xamarin", "Ionic", "Mobile UI/UX", "SwiftUI",
            "Jetpack Compose", "Machine Learning", "Deep Learning", "Data Analysis", "Data Visualization",
            "Natural Language Processing", "Computer Vision", "TensorFlow", "PyTorch", "scikit-learn", "Pandas",
            "NumPy", "Matplotlib", "Big Data", "Hadoop", "Spark", "Reinforcement Learning", "UI Design", "UX Design",
            "Figma", "Adobe XD", "Sketch", "Wireframing", "Prototyping", "User Research", "Interaction Design",
            "Usability Testing", "Unit Testing", "Integration Testing", "Automated Testing", "Manual Testing",
            "Jest", "Selenium", "Cypress", "JUnit", "Mocha", "TDD", "BDD", "Performance Testing", "Agile", "Scrum",
            "Kanban", "Jira", "Confluence", "Trello", "Project Management", "Technical Documentation", 
            "Requirements Analysis", "Artificial Intelligence", "Blockchain", "IoT", "AR/VR", "Generative AI",
            "Chatbot Development", "LLM Prompt Engineering", "Edge Computing", "Quantum Computing", "Cybersecurity",
            "Network Security", "Ethical Hacking", "Security Auditing", "Penetration Testing", "OWASP", "Encryption",
            "Identity & Access Management", "Technical Writing", "Problem Solving", "Critical Thinking", "Collaboration",
            "Team Leadership", "Communication", "Mentoring", "Code Review", "Systems Thinking", "Time Management",
            "Adaptability"
        ]
        
        count = 0
        for skill_name in skills:
            skill, created = Skill.objects.get_or_create(name=skill_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} skills'))
    
    def populate_education_levels(self):
        education_levels = [
            "High School",
            "Associate's Degree",
            "Bachelor's Degree",
            "Master's Degree",
            "PhD",
            "Diploma",
            "Certificate",
            "Self-taught"
        ]
        
        count = 0
        for level_name in education_levels:
            level, created = EducationLevel.objects.get_or_create(name=level_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} education levels'))
    
    def populate_employment_types(self):
        employment_types = [
            "Full-time",
            "Part-time",
            "Contract",
            "Freelance",
            "Internship",
            "Apprenticeship",
            "Temporary"
        ]
        
        count = 0
        for type_name in employment_types:
            emp_type, created = EmploymentType.objects.get_or_create(name=type_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} employment types'))
    
    def populate_work_environments(self):
        work_environments = [
            "Remote",
            "Hybrid",
            "On-site",
            "Flexible"
        ]
        
        count = 0
        for env_name in work_environments:
            env, created = WorkEnvironment.objects.get_or_create(name=env_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} work environments'))
    
    def populate_job_roles(self):
        job_roles = [
            "Software Engineer",
            "Data Scientist",
            "Product Manager",
            "UX Designer",
            "DevOps Engineer",
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Mobile Developer",
            "AI/ML Engineer",
            "Cloud Architect",
            "QA Engineer",
            "Security Engineer",
            "Data Engineer",
            "Technical Writer",
            "Technical Support",
            "System Administrator",
            "Database Administrator",
            "Blockchain Developer",
            "Game Developer",
            "UI Designer",
            "Project Manager",
            "Scrum Master",
            "IT Manager",
            "CTO",
            "Tech Lead",
            "Engineering Manager",
            "Solutions Architect"
        ]
        
        count = 0
        for role_name in job_roles:
            role, created = JobRole.objects.get_or_create(name=role_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} job roles'))
    
    def populate_companies(self):
        companies = [
            "Google",
            "Microsoft",
            "Amazon",
            "Meta (Facebook)",
            "Apple",
            "Netflix",
            "Adobe",
            "IBM",
            "Intel",
            "Oracle",
            "Salesforce",
            "Cisco",
            "Infosys",
            "TCS",
            "Wipro",
            "HCL Technologies",
            "Tech Mahindra",
            "Capgemini",
            "Accenture",
            "Cognizant",
            "Deloitte",
            "EY",
            "KPMG",
            "PwC",
            "Twitter",
            "Uber",
            "Airbnb",
            "Tesla",
            "PayPal",
            "LinkedIn",
            "Snapchat",
            "Spotify",
            "Zomato",
            "Swiggy",
            "Flipkart",
            "Myntra",
            "PhonePe",
            "Razorpay",
            "Paytm",
            "Ola",
            "BYJU'S",
            "Unacademy"
        ]
        
        count = 0
        for company_name in companies:
            company, created = Company.objects.get_or_create(name=company_name)
            if created:
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Created {count} companies'))