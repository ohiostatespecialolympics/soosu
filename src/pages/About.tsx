const About = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-8">
          About Us
        </h1>

        <section className="mb-12">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            Our Story
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground mb-4">
            Special Olympics at The Ohio State University is more than just a student organization—we're a 
            community united by the belief that sports have the power to change lives. As part of the global 
            Special Olympics movement, we work to provide sports training and competition opportunities for 
            individuals with intellectual disabilities in the Columbus area.
          </p>
          <p className="font-montserrat text-lg text-muted-foreground">
            Founded by passionate OSU students who recognized the need for greater inclusion on campus and 
            in the community, our chapter has grown into one of the most active and impactful organizations 
            at Ohio State. We partner with Special Olympics Ohio to coordinate events, recruit volunteers, 
            and raise funds that directly support athletes in our region.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            Our Values
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-oswald text-xl font-semibold mb-2">Inclusion</h3>
              <p className="font-montserrat text-muted-foreground">
                We believe everyone deserves the opportunity to participate in sports and be part of a team, 
                regardless of their abilities.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-oswald text-xl font-semibold mb-2">Teamwork</h3>
              <p className="font-montserrat text-muted-foreground">
                Athletes, volunteers, coaches, and supporters all work together to create an environment 
                where everyone can thrive.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-oswald text-xl font-semibold mb-2">Community Service</h3>
              <p className="font-montserrat text-muted-foreground">
                We are committed to serving our community and making a positive impact in the lives of 
                athletes with intellectual disabilities.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-oswald text-xl font-semibold mb-2">Empowerment</h3>
              <p className="font-montserrat text-muted-foreground">
                Through sports, we help athletes discover their strengths, build confidence, and achieve 
                their personal goals.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            Our Impact
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground mb-4">
            Since our founding, we have:
          </p>
          <ul className="list-disc list-inside space-y-2 font-montserrat text-muted-foreground">
            <li>Engaged over 500 OSU student volunteers</li>
            <li>Supported dozens of local athletes in various sports competitions</li>
            <li>Raised over $50,000 through our annual Polar Plunge fundraiser</li>
            <li>Partnered with multiple campus organizations to promote inclusion</li>
            <li>Created lasting friendships between athletes and volunteers</li>
          </ul>
        </section>

        <section>
          <h2 className="font-oswald text-2xl md:text-3xl font-bold mb-4 text-primary">
            National Special Olympics Mission
          </h2>
          <p className="font-montserrat text-lg text-muted-foreground italic">
            "The mission of Special Olympics is to provide year-round sports training and athletic competition 
            in a variety of Olympic-type sports for children and adults with intellectual disabilities, giving 
            them continuing opportunities to develop physical fitness, demonstrate courage, experience joy and 
            participate in a sharing of gifts, skills and friendship with their families, other Special Olympics 
            athletes and the community."
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
