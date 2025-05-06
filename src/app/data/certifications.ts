// src/data/certifications.ts

// Define the structure for a certification program
// You could also place this interface in a central types file (e.g., src/types/index.ts) and import it here and in the page component.
export interface CertificationProgram {
    id: number | string;
    title: string;
    level: string;
    duration: string;
    format: string;
    price: number;
    discountPrice: number;
    description: string;
    category: string;
    image: string; // Ensure these paths are valid relative to the public folder or are absolute URLs
  }
  
  // Define the list of certification programs
  export const certificationPrograms: CertificationProgram[] = [
      { 
        id: 1, 
        title: "AWS Certified Developer", 
        level: "Beginner", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs", 
        format: "Online + Hands-on Labs + Projects + Exams", 
        price: 80000, 
        discountPrice: 76000, 
        description: "Master essential cloud concepts and technologies across major platforms.", 
        category: "Cloud Computing", 
        image: "/images/aws.svg" 
    },
      { id: 2, 
        title: "Microsoft Certified: Azure Developer Associate", 
        level: "Beginner", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs", 
        format: "Online Self-Paced + Hands-on Labs + Projects + Exams", 
        price: 75000, 
        discountPrice: 69000, 
        description: "Validate your expertise in designing, building, testing, and maintaining cloud applications on Microsoft Azure. This certification demonstrates your proficiency in selecting, developing, and implementing Azure cloud services, covering topics like Azure SDKS, data storage solutions, debugging, security, and monitoring for cloud-native applications", 
        category: "Cloud Computing", 
        image: "/images/microsoft.png" 
    },
      
    { 
        id: 3, 
        title: "Oracle Certified Professional", 
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + Hands-on Labs + Projects + Exams", 
        price: 85000, 
        discountPrice: 78000, 
        description: "Attain a recognized benchmark of expertise in a specific Oracle technology domain. The Oracle Certified Professional credential validates your in-depth knowledge and practical skills at a high level, demonstrating your ability to handle complex tasks and contribute effectively to projects using Oracle solutions.", 
        category: "Cloud Computing", 
        image: "/images/oracle.png" 
    },
      { 
        id: 4, 
        title: "Google Professional Cloud developer", 
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + Hands-on Labs + Projects + Exams", 
        price: 90000, 
        discountPrice: 82000, 
        description: "Develop skills in network security, threat detection, and incident response.", 
        category: "Cloud Computing", 
        image: "/images/certifications/cybersecurity.jpg"
     },
      { 
        id: 5, 
        title: "PCEP - Certified Entry-Level Python Programmer", 
        level: "Beginner", 
        duration: "Self-Paced + 1 Month Mentorship",
        format: "Online + Hands-on Labs + Projects + Exams", 
        price: 50000, 
        discountPrice: 42500, 
        description: "Begin your Python programming journey with a foundational credential. The PCEP certification validates your understanding of universal computer programming concepts and essential Python syntax, making it ideal for individuals starting out in programming and looking to demonstrate their basic coding skills.", 
        category: "Mobile Development", 
        image: "/images/techgetafrica.png" 
    },
    { 
        id: 6, 
        title: "PCAP - Certified Associate in Python Programming", 
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship",
        format: "Online + Hands-on Labs + Projects + Exams", 
        price: 60000, 
        discountPrice: 55000, 
        description: "Advance your Python skills and earn an industry-recognized associate-level certification. The PCAP credential validates your ability to perform coding tasks in Python and demonstrates proficiency in more advanced concepts compared to the entry-level PCEP, proving your readiness for intermediate programming roles.", 
        category: "Programming", 
        image: "/images/techgetafrica.png" 
    },  
    { 
        id: 7, 
        title: "Microsoft Certified Power Platform Deloper Associate", 
        level: "Intermediate", 
        duration: "self-Paced + 1 Month Mentorship + 1 Month Labs", 
        format: "Online + App Projects + Exams", 
        price: 70000, 
        discountPrice: 62500, 
        description: "Demonstrate your ability to design, develop, secure, and troubleshoot solutions built on the Microsoft Power Platform. This Associate-level certification validates your skills in creating custom business applications using Power Apps, automating processes with Power Automate, building conversational bots with Power Virtual Agents, and leveraging Dataverse and other platform components.", 
        category: "Microsoft", 
        image: "/images/techgetafrica.png" 
    },
    { 
        id: 8, 
        title: "Frontend Development", 
        level: "Beginner", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs", 
        format: "Online + App Projects + Exams", 
        price: 100000, 
        discountPrice: 88000, 
        description: "Master the art of building engaging and responsive user interfaces for websites and applications. This area of study covers essential technologies like HTML, CSS, and JavaScript, along with modern frameworks and tools, to create visually appealing and interactive digital experiences.", 
        category: "Programming", 
        image: "/images/techgetafrica.png" 
    },   
    { 
        id: 9, 
        title: "Backend-end Development", 
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 110000, 
        discountPrice: 92500, 
        description: "Delve into the server-side logic, databases, and APIs that power web and mobile applications. Backend development focuses on building the unseen infrastructure, managing data, and ensuring application functionality, scalability, and security using various server-side languages and technologies.", 
        category: "Programming", 
        image: "/images/techgetafrica.png" 
    },
    { 
        id: 10, 
        title: "Software Engineering", 
        level: "Beginner",
         duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 75000, 
        discountPrice: 68000, 
        description: "Learn to apply engineering principles to the entire software development lifecycle, from design and development to testing, deployment, and maintenance. Software engineering focuses on building scalable, reliable, and efficient software systems through systematic methodologies, tools, and best practices.", 
        category: "Programming", 
        image: "/images/techgetafrica.png" 
    },
    { 
        id: 11, 
        title: "COMPTIA A+ Certification",
        level: "Beginner", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 65000, 
        discountPrice: 60000, 
        description: " Earn the industry standard for launching IT careers. The CompTIA A+ certification validates foundational skills in essential IT support technologies, including operating systems, hardware, networking, security, and troubleshooting, preparing you for entry-level IT professional roles.", 
        category: "IT", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 12, 
        title: "COMPTIA Security+ Certification", 
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 75000, 
        discountPrice: 72000, 
        description: "Validate your skills in managing, maintaining, troubleshooting, and configuring basic network infrastructure. The CompTIA Network+ certification demonstrates your ability to work with various networking technologies and protocols, making it essential for IT professionals pursuing networking roles.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 13, 
        title: "CISCO CERTIFIED+ CYBEROPS ASSOCIATE", 
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 90000, 
        discountPrice: 85000, 
        description: "Gain foundational knowledge in cybersecurity operations and incident response. The Cisco Certified CyberOps Associate certification validates your skills in security monitoring, incident response, and network intrusion analysis, preparing you for entry-level cybersecurity operations roles.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 14, 
        title: "EC COUNCIL CERTIFIED ETHICAL HACKER (CEH)", 
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 130000, 
        discountPrice: 100000, 
        description: "Master the skills of ethical hacking and penetration testing. The CEH certification validates your ability to identify vulnerabilities, conduct penetration tests, and implement security measures to protect systems and networks from cyber threats, making it essential for aspiring ethical hackers and cybersecurity professionals.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 15, 
        title: "Certified Information System Security Professional (CISSP)", 
        level: "Advanced", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 150000, 
        discountPrice: 130000, 
        description: "Achieve the gold standard in cybersecurity certification. The CISSP credential validates your expertise in designing, implementing, and managing a best-in-class cybersecurity program. It covers a broad range of topics, including security and risk management, asset security, security architecture and engineering, and more, making it ideal for experienced security practitioners.",
        category: "cybersecurity",
        image: "/images/techgetafrica.png",
    },
    { 
        id: 16, 
        title: "Certified Information Security Manager (CISM)", 
        level: "Advanced", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 140000, 
        discountPrice: 120000, 
        description: "Elevate your career in information security management. The CISM certification validates your skills in managing, designing, and overseeing an enterprise's information security program. It focuses on governance, risk management, incident management, and program development, making it essential for IT professionals pursuing managerial roles in cybersecurity.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 17, 
        title: "AWS Certified Security - Specialty ", 
        level: "Advanced", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 110000, 
        discountPrice: 90000, 
        description: "Deepen your expertise in securing AWS environments. The AWS Certified Security - Specialty certification validates your knowledge of data protection, incident response, and security best practices on the AWS platform. It is designed for individuals with experience in securing AWS workloads and is ideal for security professionals looking to specialize in cloud security.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 18, 
        title: "Microsoft Certified Security Operations Analyst Associate",
        level: "Intermediate", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 90000, 
        discountPrice: 82000, 
        description: "Validate your skills in threat detection, response, and recovery using Microsoft security solutions. The Microsoft Certified Security Operations Analyst Associate certification demonstrates your ability to monitor, detect, and respond to security threats using Microsoft Sentinel and Microsoft 365 Defender, making it essential for security operations professionals.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 19, 
        title: "ISACA Certified Information Systems Auditor (CISA)",
        level: "Advanced",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 130000, 
        discountPrice: 100000, 
        description: "Achieve a globally recognized certification in information systems auditing. The CISA certification validates your skills in auditing, controlling, and monitoring an organization's information technology and business systems. It is ideal for professionals seeking to enhance their career in IT audit, control, and security.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 20, 
        title: "Google Professional Data Engineer", 
        level: "Advanced", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 120000, 
        discountPrice: 100000, 
        description: "Design and build data processing systems on Google Cloud. The Google Professional Data Engineer certification validates your ability to design, build, operationalize, secure, and monitor data processing systems. It covers topics like data storage, data processing, machine learning, and data analysis, making it essential for data professionals working with Google Cloud.",
        category: "Data Science",
        image: "/images/techgetafrica.png"
    },
    { 
        id: 21, 
        title: "Azure Data Scientist Associate",
        level: "Intermediate",  
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 110000, 
        discountPrice: 950000, 
        description: "Validate your skills in applying data science techniques to train, evaluate, and deploy models on Azure. The Azure Data Scientist Associate certification demonstrates your ability to use Azure Machine Learning and other Azure services to build and deploy machine learning models, making it essential for data scientists working with Microsoft Azure.", 
        category: "Data Science", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 22, 
        title: "AWS Certified Machine Learning - Specialty", 
        level: "Advanced", 
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 130000, 
        discountPrice: 990000, 
        description: "Validate your expertise in building, training, tuning, and deploying machine learning models on AWS. The AWS Certified Machine Learning - Specialty certification demonstrates your ability to leverage AWS services for machine learning tasks, including data engineering, exploratory data analysis, modeling, and deployment, making it essential for machine learning professionals working with AWS.", 
        category: "Machine Learning", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 23, 
        title: "IBM Data Science Professional Certificate",
        level: "Beginner",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",  
        price: 100000, 
        discountPrice: 85000, 
        description: "Gain foundational skills in data science and machine learning. The IBM Data Science Professional Certificate validates your knowledge of data analysis, visualization, machine learning, and data science methodologies using Python and IBM Cloud tools. It is ideal for individuals looking to start a career in data science and analytics.", 
        category: "Data Science", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 24, 
        title: "TensorFlow Developer Certificate",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 95000, 
        discountPrice: 80000, 
        description: "Validate your skills in building and training machine learning models using TensorFlow. The TensorFlow Developer Certificate demonstrates your ability to use TensorFlow to build and deploy machine learning applications, making it essential for developers and data scientists working with TensorFlow.",
        category: "Machine Learning", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 25, 
        title: "SAS Data Scientist",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 130000, 
        discountPrice: 100000, 
        description: "Validate your skills in data science and machine learning using SAS software. The SAS Data Scientist certification demonstrates your ability to use SAS tools for data manipulation, statistical analysis, and machine learning model development, making it essential for data professionals working with SAS.", 
        category: "Data Science", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 26, 
        title: "Tableau Desktop Specialist",
        level: "Beginner",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 70000, 
        discountPrice: 62000, 
        description: "Validate your skills in using Tableau for data visualization and analysis. The Tableau Desktop Specialist certification demonstrates your ability to connect to data, create visualizations, and share insights using Tableau Desktop, making it essential for data analysts and business intelligence professionals working with Tableau.", 
        category: "Data Science", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 27, 
        title: "AWS Certified Solutions Architect - Associate",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 110000, 
        discountPrice: 980000, 
        description: "Validate your skills in designing distributed systems on AWS. The AWS Certified Solutions Architect - Associate certification demonstrates your ability to design and deploy scalable, highly available, and fault-tolerant systems on AWS, making it essential for solutions architects and cloud professionals working with AWS.",
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 28, 
        title: "AWS Certified DevOps Engineer - Professional",
        level: "Advanced",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 130000, 
        discountPrice: 110000, 
        description: "Validate your skills in automating the testing and deployment of AWS applications. The AWS Certified DevOps Engineer - Professional certification demonstrates your ability to implement and manage continuous delivery systems and methodologies on AWS, making it essential for DevOps engineers and cloud professionals working with AWS.", 
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 28, 
        title: "Kurbenetes Administrator",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 115000, 
        discountPrice: 100000, 
        description: "Validate your skills in managing Kubernetes clusters and applications. The Kubernetes Administrator certification demonstrates your ability to install, configure, and manage Kubernetes clusters, making it essential for system administrators and DevOps professionals working with Kubernetes.", 
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 29, 
        title: "Linux Professional Institute (LPI) Linux Essentials",
        level: "Beginner",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 100000, 
        discountPrice: 85000, 
        description: "Validate your foundational knowledge of Linux operating systems. The LPI Linux Essentials certification demonstrates your understanding of basic Linux concepts, commands, and system administration tasks, making it ideal for individuals starting their career in Linux and open-source technologies.", 
        category: "Linux", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 30, 
        title: "Cisco Certified Network Associate (CCNA)",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 120000, 
        discountPrice: 100000, 
        description: "Validate your skills in networking fundamentals and IP connectivity. The CCNA certification demonstrates your ability to install, configure, and troubleshoot networks, making it essential for network engineers and IT professionals pursuing networking roles.", 
        category: "Networking", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 30, 
        title: "Cisco Certified Network Professional (CCNP)",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 120000, 
        discountPrice: 100000, 
        description: "Validate your skills in advanced networking technologies and solutions. The CCNP certification demonstrates your ability to plan, implement, verify, and troubleshoot local and wide-area enterprise networks, making it essential for network engineers and IT professionals pursuing advanced networking roles.", 
        category: "Networking", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 31, 
        title: "CompTIA Network+ Certification",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 65000, 
        discountPrice: 55000, 
        description: "Validate your skills in managing, maintaining, troubleshooting, and configuring basic network infrastructure. The CompTIA Network+ certification demonstrates your ability to work with various networking technologies and protocols, making it essential for IT professionals pursuing networking roles.", 
        category: "Networking", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 32, 
        title: "Microsoft Azure Solutions Architect Expert",
        level: "Advanced",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 120000, 
        discountPrice: 100000, 
        description: "Validate your skills in designing and implementing solutions on Microsoft Azure. The Azure Solutions Architect Expert certification demonstrates your ability to design and implement Azure solutions, including compute, network, storage, and security, making it essential for solutions architects and cloud professionals working with Microsoft Azure.", 
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 33, 
        title: "Google Professional Cloud Architect",
        level: "Advanced",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 125000, 
        discountPrice: 100000, 
        description: "Validate your skills in designing and managing Google Cloud solutions. The Google Professional Cloud Architect certification demonstrates your ability to design, develop, and manage robust, secure, scalable, and dynamic solutions on Google Cloud Platform, making it essential for cloud architects and professionals working with Google Cloud.", 
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 34, 
        title: "Hashicorp Certified Terraform Associate",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 80000,
        discountPrice: 75000, 
        description: "Validate your skills in using Terraform for infrastructure as code. The HashiCorp Certified Terraform Associate certification demonstrates your ability to use Terraform to manage and provision cloud infrastructure, making it essential for DevOps engineers and cloud professionals working with Terraform.", 
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"      
    },
    { 
        id: 35, 
        title: "Docker Certified Associate",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 70000, 
        discountPrice: 63000, 
        description: "Validate your skills in using Docker for containerization. The Docker Certified Associate certification demonstrates your ability to use Docker to build, manage, and secure containers, making it essential for DevOps engineers and cloud professionals working with Docker.", 
        category: "Cloud Computing", 
        image: "/images/techgetafrica.png"  
    },
    { 
        id: 36, 
        title: "Juniper Networks Certified Associate (JNCIA-Junos)",
        level: "Beginner",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 85000, 
        discountPrice: 70000, 
        description: "Begin your journey in Juniper Networks technologies with this associate-level certification. The JNCIA-Junos credential validates your foundational knowledge of the Junos operating system, networking fundamentals, and basic device configuration and monitoring on Juniper Networks platforms.", 
        category: "Networking", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 37, 
        title: "Palo Alto Networks Certified Cybersecurity Associate (PCCSA)",
        level: "Beginner",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 140000, 
        discountPrice: 100000, 
        description: "Validate your foundational knowledge of cybersecurity concepts and Palo Alto Networks technologies. The PCCSA certification demonstrates your understanding of network security, cloud security, and endpoint protection, making it essential for individuals starting their career in cybersecurity and network security.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 38, 
        title: "Certified Ethical Hacker (CEH)",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 150000, 
        discountPrice: 120000, 
        description: "Master the skills of ethical hacking and penetration testing. The CEH certification validates your ability to identify vulnerabilities, conduct penetration tests, and implement security measures to protect systems and networks from cyber threats, making it essential for aspiring ethical hackers and cybersecurity professionals.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 39, 
        title: "AWS certified Advanced Networking - Specialty",
        level: "Advanced",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 130000, 
        discountPrice: 100000, 
        description: "Validate your skills in designing and implementing complex networking solutions on AWS. The AWS Certified Advanced Networking - Specialty certification demonstrates your ability to design and implement AWS and hybrid IT network architectures at scale, making it essential for networking professionals working with AWS.",
        category: "Networking", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 40, 
        title: "Microsoft Certified: Azure Network Engineer Associate",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams",
        price: 110000, 
        discountPrice: 95000, 
        description: "Validate your skills in implementing and managing Azure networking solutions. The Microsoft Certified: Azure Network Engineer Associate certification demonstrates your ability to configure, manage, and secure virtual networks in Azure, making it essential for network engineers and IT professionals working with Microsoft Azure.", 
        category: "Networking", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 41, 
        title: "Google UX Design Professional Certificate",
        level: "Beginner",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 70000, 
        discountPrice: 63000, 
        description: "Learn the foundations of UX design and build a portfolio of projects. The Google UX Design Professional Certificate validates your skills in user-centered design, wireframing, prototyping, and usability testing, making it ideal for individuals looking to start a career in UX design and research.",
        category: "UI/UX Design", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 42, 
        title: "Adobe Certified Professional in UX Design",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 75000, 
        discountPrice: 70000, 
        description: "Validate your skills in using Adobe tools for UX design. The Adobe Certified Professional in UX Design certification demonstrates your ability to create user-centered designs using Adobe XD and other Adobe Creative Cloud tools, making it essential for UX designers and professionals working with Adobe products.", 
        category: "Adobe", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 43, 
        title: "Certified Blockchain Professional (CBP)",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 100000, 
        discountPrice: 85000, 
        description: "Validate your skills in blockchain technology and its applications. The Certified Blockchain Professional (CBP) certification demonstrates your understanding of blockchain concepts, smart contracts, and decentralized applications, making it essential for professionals looking to specialize in blockchain technology.",
        category: "Blockchain", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 44, 
        title: "Ethereum Developer Certificate",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 120000, 
        discountPrice: 100000, 
        description: "Master the skills of ethical hacking and penetration testing. The CEH certification validates your ability to identify vulnerabilities, conduct penetration tests, and implement security measures to protect systems and networks from cyber threats, making it essential for aspiring ethical hackers and cybersecurity professionals.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
    { 
        id: 45, 
        title: "Hyperledger Certified Developer",
        level: "Intermediate",
        duration: "Self-Paced + 1 Month Mentorship + 1 Month Labs",
        format: "Online + App Projects + Exams", 
        price: 110000, 
        discountPrice: 100000, 
        description: "Master the skills of ethical hacking and penetration testing. The CEH certification validates your ability to identify vulnerabilities, conduct penetration tests, and implement security measures to protect systems and networks from cyber threats, making it essential for aspiring ethical hackers and cybersecurity professionals.", 
        category: "cybersecurity", 
        image: "/images/techgetafrica.png"
    },
      // ... Add all your other certification programs here
      // ... Make sure image paths are correct (e.g., start with '/' if they are in the public folder)
  ];
  
  // You can also move other related static data here if needed
   export const allCategories = [...new Set(certificationPrograms.map(cert => cert.category))];