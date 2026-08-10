import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import LegalDoc, { LegalSection } from '@/components/LegalDoc';

const Privacy = () => (
  <>
    <PageHero
      eyebrow="LEGAL"
      title="Privacy policy"
      description="How Quayvox handles information you share with us. Replace with counsel-approved text before production launch."
      image="/images/feature_compliance.jpg"
      imageAlt="Compliance and data protection"
    />

    <LegalDoc lastUpdated="August 10, 2026">
      <LegalSection index={1} title="Overview">
        <p>
          This summary describes how Quayvox (“we”, “us”) collects and uses information when
          you use our website, public track pages, contact forms, and admin product. It is a concise
          product-site placeholder — not a substitute for a counsel-reviewed policy.
        </p>
      </LegalSection>

      <LegalSection index={2} title="Information we collect">
        <p>We may collect:</p>
        <ul>
          <li>Admin account details (email, authentication identifiers, role)</li>
          <li>Shipment data you enter (tracking numbers, parties, events, ETAs)</li>
          <li>Contact form submissions (name, email, company, message)</li>
          <li>Basic technical logs needed to operate and secure the service</li>
        </ul>
      </LegalSection>

      <LegalSection index={3} title="How we use it">
        <p>
          We use this information to provide tracking, admin tools, status notifications, and to
          respond to sales or support inquiries. We do not sell personal data.
        </p>
      </LegalSection>

      <LegalSection index={4} title="Processors">
        <p>
          We use infrastructure providers such as hosting (e.g. Vercel), database and auth (e.g.
          Supabase), and email delivery (e.g. Resend) under their respective data processing terms.
        </p>
      </LegalSection>

      <LegalSection index={5} title="Retention & security">
        <p>
          We retain account and shipment data for as long as needed to provide the service and meet
          legal obligations. Access is restricted by role; admin features require authenticated
          sessions.
        </p>
      </LegalSection>

      <LegalSection index={6} title="Your choices">
        <p>
          Admins may request account changes through their organization administrator. For privacy
          questions or deletion requests related to contact submissions, email us using the address
          below.
        </p>
      </LegalSection>

      <LegalSection index={7} title="Contact">
        <p>
          Privacy questions: info@quayvox.com. You may also use the{' '}
          <Link to="/contact">contact form</Link>.
        </p>
      </LegalSection>
    </LegalDoc>
  </>
);

export default Privacy;
