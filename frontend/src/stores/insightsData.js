export const insightsData = {
    trends: {
        id: "trends",
        title: "Tech Blog",
        badge: "INSIGHTS",
        description: "Practical insights and lessons from building technology solutions in Rwanda.",
        items: [
            {
                id: "trend-1",
                type: "trend",
                image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                title: "Building Mobile-First Applications for East Africa",
                excerpt: "Key considerations when developing apps for markets with limited connectivity and diverse device capabilities.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        When building applications for East African markets, mobile-first isn't just a design philosophy—it's a necessity. Understanding the unique constraints and opportunities of this market is crucial for success.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Connectivity Challenges</h2>
                    <p class="mb-6">
                        While Rwanda has excellent 4G coverage in urban areas, many users still experience intermittent connectivity. Your application must work gracefully offline and sync data when connection is restored. Progressive Web Apps (PWAs) with service workers are particularly effective for this use case.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Data Costs Matter</h2>
                    <p class="mb-6">
                        Data is expensive for many users. Optimize images, minimize API calls, and consider implementing data-saving modes. A bloated app that consumes unnecessary data will quickly lose users, regardless of how good the features are.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Device Diversity</h2>
                    <p class="mb-6">
                        Your users might have the latest iPhone or a budget Android device from 2018. Test on low-end devices and ensure your app runs smoothly across the spectrum. Avoid heavy animations and resource-intensive features that work great on flagships but crash on budget phones.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Localization Beyond Language</h2>
                    <p class="mb-6">
                        Supporting Kinyarwanda, French, and English is just the start. Consider local payment methods (mobile money integration is essential), local naming conventions, and cultural context in your UX design.
                    </p>
                    
                    <blockquote class="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "Build for the devices your users actually have, not the ones you wish they had."
                    </blockquote>
                `,
                date: "Feb 08, 2025",
                author: "Development Team",
                readTime: "5 min read",
                category: "Development",
                tags: ["Mobile", "Development", "UX", "Africa"]
            },
            {
                id: "trend-2",
                type: "trend",
                image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=800&q=80",
                title: "Integrating Mobile Money Payments in Your Application",
                excerpt: "A practical guide to implementing MTN Mobile Money and Airtel Money in Rwanda.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        Mobile money is the primary payment method in Rwanda. If your application involves transactions, mobile money integration isn't optional—it's essential.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Understanding the Ecosystem</h2>
                    <p class="mb-6">
                        Rwanda's mobile money landscape is dominated by MTN Mobile Money (MoMo) and Airtel Money. Most users have at least one of these services. Both offer APIs for merchant integration, though the documentation and developer experience vary.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">API Integration Basics</h2>
                    <p class="mb-6">
                        You'll need to register as a merchant with each provider. For MTN, this involves working with their business development team and obtaining API credentials. The process can take 2-4 weeks, so plan accordingly. The APIs typically support collection (receiving payments) and disbursement (sending money to users).
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Testing Environment</h2>
                    <p class="mb-6">
                        Both providers offer sandbox environments for testing. Use them extensively before going live. Test edge cases like failed transactions, timeouts, and duplicate requests. Mobile money transactions are asynchronous—your application must handle callbacks properly.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">User Experience Considerations</h2>
                    <p class="mb-6">
                        Keep the payment flow simple. Users enter their phone number and receive a USSD prompt to confirm payment. Don't ask for PIN in your app—that's a security red flag. Always show clear transaction confirmations and handle the delay between initiation and completion gracefully.
                    </p>
                    
                    <blockquote class="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "Mobile money integration is about trust. Handle transactions transparently and securely."
                    </blockquote>
                `,
                date: "Jan 25, 2025",
                author: "Fintech Team",
                readTime: "6 min read",
                category: "Fintech",
                tags: ["MobileMoney", "Payments", "Integration", "Rwanda"]
            },
            {
                id: "trend-3",
                type: "trend",
                image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
                title: "Hosting and Infrastructure: Cloud Options for Rwanda-Based Startups",
                excerpt: "Comparing AWS, Google Cloud, and local hosting options for your tech startup in Rwanda.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        Choosing where to host your application is a critical decision that affects performance, cost, and scalability. Here's what we've learned from running production systems in Rwanda.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Global Cloud Providers</h2>
                    <p class="mb-6">
                        AWS and Google Cloud don't have data centers in Rwanda, but both have presence in South Africa (Cape Town region). This gives you decent latency for East African users—typically 40-80ms. The advantage is world-class infrastructure, extensive services, and strong documentation. The downside is cost, especially for data transfer.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Local Hosting Options</h2>
                    <p class="mb-6">
                        Rwanda has local data centers and hosting providers. Latency is excellent (5-20ms for Kigali users), and costs can be lower for certain workloads. However, you may have fewer managed services available, which means more DevOps work on your end. Good for serving local users but consider CDN for broader African reach.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Hybrid Approach</h2>
                    <p class="mb-6">
                        Many successful startups use a hybrid model: core services on AWS/GCP for reliability and scale, with local caching or edge servers in Rwanda for static assets and frequently accessed data. This balances performance and cost.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Cost Management</h2>
                    <p class="mb-6">
                        Cloud costs can spiral quickly. Start with the basics: use auto-scaling, set up billing alerts, choose appropriate instance sizes, and leverage reserved instances or committed use discounts once you have stable usage patterns. Monitor your spending weekly, not monthly.
                    </p>
                    
                    <blockquote class="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "Start simple, monitor closely, and scale based on actual user behavior—not assumptions."
                    </blockquote>
                `,
                date: "Feb 02, 2025",
                author: "Infrastructure Team",
                readTime: "7 min read",
                category: "Infrastructure",
                tags: ["Cloud", "AWS", "Hosting", "DevOps"]
            }
        ]
    },
    events: {
        id: "events",
        title: "Events",
        badge: "COMMUNITY",
        description: "Tech meetups and workshops we're organizing.",
        items: [
            {
                id: "event-1",
                type: "event",
                image: "https://images.unsplash.com/photo-1540575861501-7ad05863f19a?w=800&q=80",
                title: "Monthly Developer Meetup - March 2025",
                excerpt: "Join us for our monthly gathering of developers, designers, and tech enthusiasts in Kigali.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        Our monthly developer meetup is back! Join fellow developers, designers, and tech enthusiasts for an evening of learning, networking, and sharing experiences.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What to Expect</h2>
                    <p class="mb-6">
                        Each meetup features 2-3 short presentations from community members sharing their projects, lessons learned, or technical deep-dives. This month, we'll hear about building a successful e-commerce platform in Rwanda, optimizing React performance, and integrating AI into mobile apps.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Schedule</h2>
                    <p class="mb-6">
                        6:00 PM - Networking and refreshments<br>
                        6:30 PM - Welcome and announcements<br>
                        6:45 PM - First presentation<br>
                        7:15 PM - Second presentation<br>
                        7:45 PM - Third presentation<br>
                        8:15 PM - Open networking
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Who Should Attend</h2>
                    <p class="mb-6">
                        Everyone is welcome! Whether you're a student learning to code, a professional developer, or just curious about tech, you'll find value in connecting with the community. Bring your questions, your projects, and your enthusiasm.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Location & Registration</h2>
                    <p class="mb-6">
                        Abytech Hub, Kicukiro, Kigali. Space is limited to 50 attendees. Register on our website or email events@abytechhub.com by March 10th. Admission is free.
                    </p>
                    
                    <blockquote class="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "The best code is written in community. Join us and be part of Kigali's growing tech scene."
                    </blockquote>
                `,
                date: "Mar 15, 2025",
                location: "Abytech Hub, Kicukiro",
                attendees: "50 max",
                organizer: "Abytech Hub",
                readTime: "3 min read",
                category: "Event",
                tags: ["Meetup", "Networking", "Developers", "Kigali"]
            }
        ]
    },
    announcements: {
        id: "announcements",
        title: "Announcements",
        badge: "NEWS",
        description: "Latest updates from Abytech Hub.",
        items: [
            {
                id: "ann-1",
                type: "announcement",
                image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
                title: "New Co-Working Space Opening April 2025",
                excerpt: "Expanding our facilities to accommodate more developers and startups.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        We're excited to announce the expansion of Abytech Hub with a new co-working space opening in April 2025. This new facility will provide dedicated workspace for developers, startups, and tech teams in Kigali.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What's Included</h2>
                    <p class="mb-6">
                        The new space features 30 desk positions, 2 private meeting rooms, high-speed fiber internet, backup power, printing facilities, and a shared kitchen area. Members will also have access to our monthly meetups and training workshops.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Membership Plans</h2>
                    <p class="mb-6">
                        We offer flexible membership options: full-time desks (RWF 150,000/month), part-time access (RWF 80,000/month for 10 days), and day passes (RWF 10,000/day). Student discounts available with valid ID.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Early Bird Special</h2>
                    <p class="mb-6">
                        Sign up before March 31st and get your first month at 50% off. Limited to the first 15 members. Visit our office or email info@abytechhub.com to reserve your spot.
                    </p>
                    
                    <blockquote class="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "Build your next project in a community of makers, creators, and innovators."
                    </blockquote>
                `,
                date: "Feb 05, 2025",
                readTime: "3 min read",
                category: "Announcement",
                tags: ["CoWorking", "Workspace", "Expansion"]
            },
            {
                id: "ann-2",
                type: "announcement",
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
                title: "Free Web Development Workshop for Beginners",
                excerpt: "Learn HTML, CSS, and JavaScript basics in our upcoming 3-week workshop series.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        Abytech Hub is offering a free 3-week web development workshop for beginners. Whether you're looking to start a career in tech or just want to build your own website, this course will give you the fundamentals you need.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What You'll Learn</h2>
                    <p class="mb-6">
                        Week 1: HTML fundamentals and webpage structure<br>
                        Week 2: CSS styling, layouts, and responsive design<br>
                        Week 3: JavaScript basics and interactive elements
                    </p>
                    <p class="mb-6">
                        By the end of the workshop, you'll have built your own personal website from scratch and understand the core technologies that power the web.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Requirements</h2>
                    <p class="mb-6">
                        No prior coding experience needed! Just bring a laptop and enthusiasm to learn. Classes are held in English with Kinyarwanda support available.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Schedule & Registration</h2>
                    <p class="mb-6">
                        Saturdays, March 8, 15, and 22, from 9:00 AM - 1:00 PM. Limited to 25 participants. Register at info@abytechhub.com by March 1st. First come, first served.
                    </p>
                    
                    <blockquote class="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "Every developer started as a beginner. Your journey starts here."
                    </blockquote>
                `,
                date: "Feb 10, 2025",
                readTime: "3 min read",
                category: "Workshop",
                tags: ["Training", "WebDevelopment", "Beginners", "Free"]
            }
        ]
    },
    jobs: {
        id: "jobs",
        title: "Careers",
        badge: "JOIN US",
        description: "Open positions at Abytech Hub.",
        items: [
            {
                id: "job-1",
                type: "job",
                title: "Full-Stack Developer",
                jobType: "Full-Time",
                location: "Kigali, Rwanda",
                posted: "3 days ago",
                salary: "RWF 1.5M - 2.5M/month",
                excerpt: "Build web applications for clients across Rwanda and East Africa using React and Node.js.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        We're looking for a full-stack developer to join our small but growing team. You'll work on real client projects, from e-commerce platforms to business management systems, primarily serving Rwandan and East African markets.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What You'll Do</h2>
                    <p class="mb-6">
                        Build and maintain web applications using React and Node.js, work directly with clients to understand requirements, write clean code that others can understand and maintain, participate in code reviews, and help junior developers grow their skills.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Requirements</h2>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        <li>2+ years building web applications professionally</li>
                        <li>Strong JavaScript skills (React and Node.js preferred)</li>
                        <li>Experience with databases (PostgreSQL or MongoDB)</li>
                        <li>Understanding of RESTful APIs</li>
                        <li>Git version control</li>
                        <li>Good communication in English</li>
                        <li>Based in Kigali or willing to relocate</li>
                    </ul>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Nice to Have</h2>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        <li>Mobile money payment integration experience</li>
                        <li>Cloud deployment (AWS or similar)</li>
                        <li>Kinyarwanda or French language skills</li>
                        <li>Previous work with African market applications</li>
                    </ul>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What We Offer</h2>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        <li>Competitive salary (RWF 1.5M - 2.5M based on experience)</li>
                        <li>Flexible work hours and some remote work options</li>
                        <li>Health insurance</li>
                        <li>Learning budget for courses and conferences</li>
                        <li>Work on diverse, interesting projects</li>
                        <li>Small team where your work matters</li>
                    </ul>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">How to Apply</h2>
                    <p class="mb-6">
                        Send your CV and a brief note about why you're interested to jobs@abytechhub.com. Include links to 2-3 projects you've worked on (GitHub repos, live sites, or descriptions). No cover letter required—just tell us about your experience in a few sentences.
                    </p>
                `,
                readTime: "4 min read",
                category: "Engineering",
                tags: ["React", "Node.js", "Full-Stack", "Development"],
                requirements: ["React", "Node.js", "2+ years experience", "Kigali-based"],
                applyLink: "mailto:jobs@abytechhub.com"
            },
            {
                id: "job-2",
                type: "job",
                title: "Sales & Marketing Associate",
                jobType: "Full-Time",
                location: "Kigali, Rwanda",
                posted: "1 week ago",
                salary: "RWF 800K - 1.2M/month + commission",
                excerpt: "Help grow Abytech Hub by connecting with potential clients and promoting our services.",
                fullContent: `
                    <p class="text-xl text-slate-900 font-bold mb-8">
                        We're looking for someone who can help more businesses discover how technology can solve their problems. You'll split your time between finding new clients, creating content for our social media, and helping existing clients succeed.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Responsibilities</h2>
                    <p class="mb-6">
                        Identify and reach out to potential clients (businesses that could benefit from custom software), manage our social media presence (LinkedIn, Twitter, Instagram), create content about tech in Rwanda, help organize our monthly meetups and workshops, maintain relationships with existing clients, and support sales from initial contact through project kick-off.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">Requirements</h2>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        <li>1-3 years in sales, marketing, or business development</li>
                        <li>Excellent communication skills (English required, Kinyarwanda/French a plus)</li>
                        <li>Comfortable with social media and basic digital marketing</li>
                        <li>Self-starter who can work independently</li>
                        <li>Interest in technology (you don't need to code!)</li>
                        <li>Network in Kigali business community is helpful</li>
                        <li>Based in Kigali</li>
                    </ul>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What We're Looking For</h2>
                    <p class="mb-6">
                        Someone who genuinely enjoys talking to people, can explain technical concepts in simple terms, is creative with content creation, follows through on commitments, and is excited about Rwanda's growing tech scene.
                    </p>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">What We Offer</h2>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        <li>Base salary RWF 800K - 1.2M depending on experience</li>
                        <li>Commission on new business you bring in</li>
                        <li>Flexible work environment</li>
                        <li>Health insurance after probation period</li>
                        <li>Opportunity to shape our brand and growth</li>
                        <li>Work with a passionate team</li>
                    </ul>
                    
                    <h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">How to Apply</h2>
                    <p class="mb-6">
                        Email jobs@abytechhub.com with your CV and answers to these questions: What interests you about this role? How would you promote Abytech Hub to potential clients? Give us an example of something you've successfully sold or marketed. Keep it conversational—we want to hear your voice!
                    </p>
                `,
                readTime: "4 min read",
                category: "Business",
                tags: ["Sales", "Marketing", "Business Development", "Social Media"],
                requirements: ["Sales experience", "Digital marketing", "Communication skills", "Kigali-based"],
                applyLink: "mailto:jobs@abytechhub.com"
            }
        ]
    }
};

// Helper function to get all items across all categories
export const getAllInsights = () => {
    return [
        ...insightsData.trends.items,
        ...insightsData.events.items,
        ...insightsData.announcements.items,
        ...insightsData.jobs.items
    ];
};

// Helper function to find item by ID and type
export const getInsightItem = (id, type) => {
    if (!type) return null;

    const categoryMap = {
        'trend': 'trends',
        'event': 'events',
        'announcement': 'announcements',
        'job': 'jobs'
    };

    const categoryKey = categoryMap[type];
    if (!categoryKey) return null;

    const category = insightsData[categoryKey];
    return category?.items.find(item => item.id === id);
};

// Helper function to get badge text based on type
export const getBadgeText = (type) => {
    switch (type) {
        case 'trend':
            return 'INSIGHTS';
        case 'event':
            return 'COMMUNITY EVENT';
        case 'job':
            return 'CAREER OPPORTUNITY';
        case 'announcement':
            return 'NEWS';
        default:
            return 'ARTICLE';
    }
};