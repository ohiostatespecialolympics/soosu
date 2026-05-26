import { useContent } from "@/hooks/useContent";

const About = () => {
  const title = useContent("about.title", "About Us");
  const storyTitle = useContent("about.story.title", "Our Story");
  const storyP1 = useContent("about.story.p1", "Special Olympics at The Ohio State University is more than just a student organization—we're a community united by the belief that sports have the power to change lives. As part of the global Special Olympics movement, we work to provide sports training and competition opportunities for individuals with intellectual disabilities in the Columbus area.");
  const storyP2 = useContent("about.story.p2", "Founded by passionate OSU students who recognized the need for greater inclusion on campus and in the community, our chapter has grown into one of the most active and impactful organizations at Ohio State. We partner with Special Olympics Ohio to coordinate events, recruit volunteers, and raise funds that directly support athletes in our region.");
  const valuesTitle = useContent("about.values.title", "Our Values");
  const v1t = useContent("about.values.v1_title", "Inclusion");
  const v1b = useContent("about.values.v1_body", "We believe everyone deserves the opportunity to participate in sports and be part of a team, regardless of their abilities.");
  const v2t = useContent("about.values.v2_title", "Teamwork");
  const v2b = useContent("about.values.v2_body", "Athletes, volunteers, coaches, and supporters all work together to create an environment where everyone can thrive.");
  const v3t = useContent("about.values.v3_title", "Community Service");
  const v3b = useContent("about.values.v3_body", "We are committed to serving our community and making a positive impact in the lives of athletes with intellectual disabilities.");
  const v4t = useContent("about.values.v4_title", "Empowerment");
  const v4b = useContent("about.values.v4_body", "Through sports, we help athletes discover their strengths, build confidence, and achieve their personal goals.");
  const impactTitle = useContent("about.impact.title", "Our Impact");
  const impactIntro = useContent("about.impact.intro", "Since our founding, we have:");
  const impactBullets = useContent("about.impact.bullets", "Engaged over 500 OSU student volunteers\nSupported dozens of local athletes in various sports competitions\nRaised over $50,000 through our annual Polar Plunge fundraiser\nPartnered with multiple campus organizations to promote inclusion\nCreated lasting friendships between athletes and volunteers");
  const nationalTitle = useContent("about.national.title", "National Special Olympics Mission");
  const nationalBody = useContent("about.national.body", "");
  const bullets = impactBullets.split("\n").map(s => s.trim()).filter(Boolean);
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-8">
          {title}
        </h1>

        <section className="mb-12">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            {storyTitle}
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground mb-4 whitespace-pre-line">{storyP1}</p>
          <p className="font-montserrat text-lg text-muted-foreground whitespace-pre-line">{storyP2}</p>
        </section>

        <section className="mb-12">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            {valuesTitle}
          </h2>
          <div className="space-y-4">
            {[
              { t: v1t, b: v1b },
              { t: v2t, b: v2b },
              { t: v3t, b: v3b },
              { t: v4t, b: v4b },
            ].map((v, i) => (
              <div key={i} className="border-l-4 border-primary pl-4">
                <h3 className="font-oswald text-xl font-semibold mb-2">{v.t}</h3>
                <p className="font-montserrat text-muted-foreground whitespace-pre-line">{v.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            {impactTitle}
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground mb-4">
            {impactIntro}
          </p>
          <ul className="list-disc list-inside space-y-2 font-montserrat text-muted-foreground">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </section>

        <section>
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            {nationalTitle}
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground italic whitespace-pre-line">{nationalBody}</p>
        </section>
      </div>
    </div>
  );
};

export default About;
