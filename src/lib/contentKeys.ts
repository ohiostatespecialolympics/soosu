/**
 * Editable content blocks shown in the CMS.
 * Each entry's `fallback` is what renders if no DB row exists for the key.
 * Add new keys here AND in the component that uses `useContent(key, fallback)`.
 */
export type ContentDef = {
  key: string;
  page: string;
  label: string;
  type?: "text" | "longtext";
  fallback: string;
};

export const CONTENT_DEFS: ContentDef[] = [
  // ── HOME ──
  { key: "home.hero.tag", page: "Home", label: "Hero chapter tag", fallback: "The Ohio State University Chapter" },
  { key: "home.hero.title1", page: "Home", label: "Hero title — line 1", fallback: "EMPOWERING" },
  { key: "home.hero.title2", page: "Home", label: "Hero title — line 2", fallback: "ATHLETES." },
  { key: "home.hero.subtitle", page: "Home", label: "Hero subtitle", fallback: "Celebrating Ability." },
  { key: "home.hero.subtext", page: "Home", label: "Hero subtext", type: "longtext", fallback: "Building an inclusive community through sports, one athlete at a time." },
  { key: "home.hero.cta_primary", page: "Home", label: "Primary CTA label", fallback: "Get Involved" },
  { key: "home.hero.cta_secondary", page: "Home", label: "Secondary CTA label", fallback: "View Events" },
  { key: "home.stats.volunteers", page: "Home", label: "Stat — volunteers count (number+suffix)", fallback: "150+" },
  { key: "home.stats.athletes", page: "Home", label: "Stat — athletes count", fallback: "300+" },
  { key: "home.stats.events", page: "Home", label: "Stat — events/year count", fallback: "100+" },
  { key: "home.mission.title", page: "Home", label: "Mission heading", fallback: "Our Mission" },
  { key: "home.mission.body", page: "Home", label: "Mission body", type: "longtext", fallback: "As the Ohio State University chapter of Special Olympics, we are dedicated to providing year-round sports training and athletic competition in a variety of Olympic-type sports for children and adults with intellectual disabilities. We give our athletes continuing opportunities to develop physical fitness, demonstrate courage, experience joy, and participate in a sharing of gifts, skills, and friendship with their families, other Special Olympics athletes, and the community." },
  { key: "home.whatwedo.title", page: "Home", label: "What We Do heading", fallback: "What We Do" },
  { key: "home.whatwedo.card1_title", page: "Home", label: "Card 1 title", fallback: "Athlete Support" },
  { key: "home.whatwedo.card1_body", page: "Home", label: "Card 1 body", type: "longtext", fallback: "We provide comprehensive support for Special Olympics athletes, including training, equipment, and transportation to competitions throughout the year." },
  { key: "home.whatwedo.card2_title", page: "Home", label: "Card 2 title", fallback: "Campus Events" },
  { key: "home.whatwedo.card2_body", page: "Home", label: "Card 2 body", type: "longtext", fallback: "From our annual Polar Plunge to regular volunteer opportunities, we host engaging events that bring the OSU community together around inclusion." },
  { key: "home.whatwedo.card3_title", page: "Home", label: "Card 3 title", fallback: "Community Impact" },
  { key: "home.whatwedo.card3_body", page: "Home", label: "Card 3 body", type: "longtext", fallback: "Through partnerships with local organizations and schools, we extend our impact beyond campus to create lasting change in the Columbus community." },
  { key: "home.impact.title", page: "Home", label: "Impact heading", fallback: "Making a Difference Together" },
  { key: "home.impact.body", page: "Home", label: "Impact body", type: "longtext", fallback: "Last semester, over 60 dedicated volunteers joined us to support our athletes and events." },
  { key: "home.impact.cta", page: "Home", label: "Impact CTA label", fallback: "Join Our Team" },

  // ── ABOUT ──
  { key: "about.title", page: "About", label: "Page title", fallback: "About Us" },
  { key: "about.story.title", page: "About", label: "Our Story heading", fallback: "Our Story" },
  { key: "about.story.p1", page: "About", label: "Story paragraph 1", type: "longtext", fallback: "Special Olympics at The Ohio State University is more than just a student organization—we're a community united by the belief that sports have the power to change lives. As part of the global Special Olympics movement, we work to provide sports training and competition opportunities for individuals with intellectual disabilities in the Columbus area." },
  { key: "about.story.p2", page: "About", label: "Story paragraph 2", type: "longtext", fallback: "Founded by passionate OSU students who recognized the need for greater inclusion on campus and in the community, our chapter has grown into one of the most active and impactful organizations at Ohio State. We partner with Special Olympics Ohio to coordinate events, recruit volunteers, and raise funds that directly support athletes in our region." },
  { key: "about.values.title", page: "About", label: "Values heading", fallback: "Our Values" },
  { key: "about.values.v1_title", page: "About", label: "Value 1 title", fallback: "Inclusion" },
  { key: "about.values.v1_body", page: "About", label: "Value 1 body", type: "longtext", fallback: "We believe everyone deserves the opportunity to participate in sports and be part of a team, regardless of their abilities." },
  { key: "about.values.v2_title", page: "About", label: "Value 2 title", fallback: "Teamwork" },
  { key: "about.values.v2_body", page: "About", label: "Value 2 body", type: "longtext", fallback: "Athletes, volunteers, coaches, and supporters all work together to create an environment where everyone can thrive." },
  { key: "about.values.v3_title", page: "About", label: "Value 3 title", fallback: "Community Service" },
  { key: "about.values.v3_body", page: "About", label: "Value 3 body", type: "longtext", fallback: "We are committed to serving our community and making a positive impact in the lives of athletes with intellectual disabilities." },
  { key: "about.values.v4_title", page: "About", label: "Value 4 title", fallback: "Empowerment" },
  { key: "about.values.v4_body", page: "About", label: "Value 4 body", type: "longtext", fallback: "Through sports, we help athletes discover their strengths, build confidence, and achieve their personal goals." },
  { key: "about.impact.title", page: "About", label: "Impact heading", fallback: "Our Impact" },
  { key: "about.impact.intro", page: "About", label: "Impact intro", fallback: "Since our founding, we have:" },
  { key: "about.impact.bullets", page: "About", label: "Impact bullets (one per line)", type: "longtext", fallback: "Engaged over 500 OSU student volunteers\nSupported dozens of local athletes in various sports competitions\nRaised over $50,000 through our annual Polar Plunge fundraiser\nPartnered with multiple campus organizations to promote inclusion\nCreated lasting friendships between athletes and volunteers" },
  { key: "about.national.title", page: "About", label: "National mission heading", fallback: "National Special Olympics Mission" },
  { key: "about.national.body", page: "About", label: "National mission body", type: "longtext", fallback: "\"The mission of Special Olympics is to provide year-round sports training and athletic competition in a variety of Olympic-type sports for children and adults with intellectual disabilities, giving them continuing opportunities to develop physical fitness, demonstrate courage, experience joy and participate in a sharing of gifts, skills and friendship with their families, other Special Olympics athletes and the community.\"" },

  // ── GET INVOLVED ──
  { key: "getinvolved.title", page: "Get Involved", label: "Page title", fallback: "Get Involved" },
  { key: "getinvolved.intro", page: "Get Involved", label: "Intro paragraph", type: "longtext", fallback: "There are many ways to support Special Olympics at OSU. Whether you want to volunteer, participate as an athlete, or partner with us, we'd love to have you join our community." },
  { key: "getinvolved.students.title", page: "Get Involved", label: "Students card title", fallback: "Students" },
  { key: "getinvolved.students.desc", page: "Get Involved", label: "Students card description", type: "longtext", fallback: "Join our team of dedicated volunteers who support athletes at practices and events." },
  { key: "getinvolved.athletes.title", page: "Get Involved", label: "Athletes card title", fallback: "Athletes" },
  { key: "getinvolved.athletes.desc", page: "Get Involved", label: "Athletes card description", type: "longtext", fallback: "Are you or someone you know interested in joining Special Olympics?" },
  { key: "getinvolved.partners.title", page: "Get Involved", label: "Partners card title", fallback: "Companies & Clubs" },
  { key: "getinvolved.partners.desc", page: "Get Involved", label: "Partners card description", type: "longtext", fallback: "Partner with us to bring inclusion initiatives to your group or organization." },
  { key: "getinvolved.testimonials.title", page: "Get Involved", label: "Testimonials heading", fallback: "What Our Members Say" },
  { key: "getinvolved.testimonial1.quote", page: "Get Involved", label: "Testimonial 1 quote", type: "longtext", fallback: "Special Olympics is such an incredible organization because it allows Ohio State students to connect with the Columbus community around us. Working with the athletes is an inspiring and heart-warming experience." },
  { key: "getinvolved.testimonial1.attrib", page: "Get Involved", label: "Testimonial 1 attribution", fallback: "— Alex S., Sophomore Volunteer" },
  { key: "getinvolved.testimonial2.quote", page: "Get Involved", label: "Testimonial 2 quote", type: "longtext", fallback: "Being part of this organization has taught me so much about inclusion, patience, and the power of community. I've made lifelong friends here." },
  { key: "getinvolved.testimonial2.attrib", page: "Get Involved", label: "Testimonial 2 attribution", fallback: "— Marcus T., Senior Volunteer" },
  { key: "getinvolved.questions.title", page: "Get Involved", label: "Questions heading", fallback: "Have Questions?" },
  { key: "getinvolved.questions.body", page: "Get Involved", label: "Questions body", fallback: "We'd love to hear from you. Visit our contact page to reach out directly." },

  // ── JOIN US ──
  { key: "join.hero.tag", page: "Join Us", label: "Hero tag", fallback: "Volunteer with us" },
  { key: "join.hero.title", page: "Join Us", label: "Hero title", fallback: "Five steps to\njoin the team." },
  { key: "join.hero.subtext", page: "Join Us", label: "Hero subtext", type: "longtext", fallback: "No experience needed — just a willingness to show up. Follow the checklist below and you'll be part of one of the most rewarding communities on campus." },
  { key: "join.step1.title", page: "Join Us", label: "Step 1 title", fallback: "Learn About Us" },
  { key: "join.step1.body", page: "Join Us", label: "Step 1 body", type: "longtext", fallback: "Special Olympics at Ohio State is a student-run organization that partners with local Special Olympics programs to provide sports training, competition, and community for individuals with intellectual disabilities. No experience needed — just a willingness to show up and make a difference." },
  { key: "join.step2.title", page: "Join Us", label: "Step 2 title", fallback: "Fill Out an Interest Form" },
  { key: "join.step2.body", page: "Join Us", label: "Step 2 body", type: "longtext", fallback: "Let us know you're interested! Fill out our quick interest form so our team can reach out with next steps, upcoming events, and ways to get involved right away." },
  { key: "join.step2.cta_url", page: "Join Us", label: "Step 2 interest form URL", fallback: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform" },
  { key: "join.step3.title", page: "Join Us", label: "Step 3 title", fallback: "Join Our GroupMe" },
  { key: "join.step3.body", page: "Join Us", label: "Step 3 body", type: "longtext", fallback: "Our GroupMe is where we share updates, event reminders, and coordinate everything. It's the fastest way to stay in the loop and connect with other volunteers." },
  { key: "join.step3.cta_url", page: "Join Us", label: "Step 3 GroupMe URL", fallback: "https://groupme.com/join_group/YOUR_GROUP_ID" },
  { key: "join.step4.title", page: "Join Us", label: "Step 4 title", fallback: "Complete Online Training" },
  { key: "join.step4.body", page: "Join Us", label: "Step 4 body", type: "longtext", fallback: "Once you've filled out the interest form and joined the GroupMe, you'll be added to our Canvas page. From there, complete a quick 15-minute online training — it's simple, self-paced, and only needs to be done once." },
  { key: "join.step5.title", page: "Join Us", label: "Step 5 title", fallback: "Show Up to Practices & Events" },
  { key: "join.step5.body", page: "Join Us", label: "Step 5 body", type: "longtext", fallback: "That's it — you're in! Come to weekly practices, attend competitions, and join social events throughout the semester. There's no minimum commitment, but we recommend attending at least 2–3 events per semester to get the most out of the experience." },
  { key: "join.bottom.title", page: "Join Us", label: "Bottom CTA heading", fallback: "Questions? We're Here to Help." },
  { key: "join.bottom.body", page: "Join Us", label: "Bottom CTA body", fallback: "Not sure where to start? Reach out and we'd love to chat." },
];

export const CONTENT_PAGES = Array.from(new Set(CONTENT_DEFS.map(d => d.page)));