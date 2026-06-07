const Privacy = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-8">
          Privacy Policy
        </h1>
        <p className="font-montserrat text-sm text-muted-foreground text-center mb-12">
          Last updated: June 7, 2026
        </p>

        <div className="space-y-10 font-montserrat text-muted-foreground">
          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Introduction</h2>
            <p>
              Special Olympics at The Ohio State University ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your information when you visit our website at soosu.org (the "Site"), use our services, or interact with us.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>
                <strong className="text-foreground">Contact Information:</strong> When you submit a message through our contact form, we collect your name, email address, subject, and message content. This data is processed through Formspree and sent to our team.
              </li>
              <li>
                <strong className="text-foreground">Account Information:</strong> If you create an account to access our admin portal, we collect your email address and authentication credentials through Supabase Auth. If you sign in with Google, we receive your Google profile information (name, email, and profile picture) as authorized by you.
              </li>
              <li>
                <strong className="text-foreground">Event & Volunteer Data:</strong> When you register for events, sign up to volunteer, or express interest in joining, we may collect your name, email, phone number, and any other details necessary to coordinate participation.
              </li>
              <li>
                <strong className="text-foreground">Donation Information:</strong> If and when online donations are enabled, payment information is collected and processed by our third-party payment processor. We do not store full credit card details on our servers.
              </li>
              <li>
                <strong className="text-foreground">Automatically Collected Information:</strong> We use Vercel Analytics and Google Analytics to collect standard web log information such as your browser type, device type, IP address (anonymized where possible), pages visited, and time spent on the Site. This helps us understand how visitors use our website and improve the experience.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Respond to your inquiries and communicate with you about events, volunteer opportunities, and organization updates.</li>
              <li>Manage your account and provide access to admin tools (for authorized student leaders).</li>
              <li>Coordinate event registration, volunteer scheduling, and athlete support activities.</li>
              <li>Process donations and send acknowledgments or receipts.</li>
              <li>Analyze website usage and improve our Site, services, and outreach.</li>
              <li>Comply with legal obligations and enforce our terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Cookies and Tracking Technologies</h2>
            <p>
              Our Site uses cookies and similar technologies to enhance your browsing experience, analyze traffic, and understand how you interact with our content. You can control cookies through your browser settings. Disabling cookies may affect certain features of the Site.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Third-Party Services</h2>
            <p className="mb-3">We rely on trusted third-party providers to operate our services. These include:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>
                <strong className="text-foreground">Supabase</strong> — for database hosting, authentication, and serverless functions. Data stored in Supabase is subject to Supabase's Privacy Policy and security practices.
              </li>
              <li>
                <strong className="text-foreground">Formspree</strong> — for processing contact form submissions. Information sent through our contact form is handled in accordance with Formspree's privacy practices.
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong> — for web hosting and analytics. Vercel may process IP addresses and related metadata for performance and security purposes.
              </li>
              <li>
                <strong className="text-foreground">Google</strong> — for OAuth authentication and analytics. Google's use of information is governed by the Google Privacy Policy.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect your personal information. This includes using encrypted connections (HTTPS), secure authentication methods, and access controls for admin functionality. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Contact form submissions and event registrations are typically retained for the duration of the academic year plus one additional year for record-keeping, after which they may be anonymized or deleted.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Your Rights and Choices</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your personal information, subject to legal obligations.</li>
              <li>Opt out of certain communications (e.g., event newsletters).</li>
              <li>Withdraw consent for processing where consent is the legal basis.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us at <a href="mailto:contact@soosu.org" className="text-primary hover:underline">contact@soosu.org</a>.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Children's Privacy</h2>
            <p>
              Our Site is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The updated version will be indicated by a revised "Last updated" date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-oswald text-2xl font-bold text-foreground mb-3">Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Email:</strong>{" "}
              <a href="mailto:contact@soosu.org" className="text-primary hover:underline">contact@soosu.org</a>
              <br />
              <strong className="text-foreground">Address:</strong> Ohio Union, 1739 N High St, Columbus, OH 43210
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
