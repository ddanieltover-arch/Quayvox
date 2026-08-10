import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import LegalDoc, { LegalSection } from '@/components/LegalDoc';

const Terms = () => (
  <>
    <PageHero
      eyebrow="LEGAL"
      title="Terms of use"
      description="Terms governing use of the Quayvox website and product. Replace with counsel-approved terms before production launch."
      image="/images/feature_compliance.jpg"
      imageAlt="Service terms and compliance"
    />

    <LegalDoc lastUpdated="August 10, 2026">
      <LegalSection index={1} title="Acceptance">
        <p>
          By accessing Quayvox you agree to these terms. If you use the product on behalf of an
          organization, you represent that you have authority to bind that organization. This page
          is a product-site placeholder and should be replaced with counsel-approved terms before
          production launch.
        </p>
      </LegalSection>

      <LegalSection index={2} title="Accounts">
        <p>
          Admin accounts are invite-only. You are responsible for safeguarding credentials and for
          activity under your account. Notify us promptly if you suspect unauthorized access.
        </p>
      </LegalSection>

      <LegalSection index={3} title="Service">
        <p>
          We provide logistics visibility software on an “as available” basis. Demo features that are
          clearly labeled as previews are not production guarantees. Service levels and uptime
          commitments apply only under an Enterprise agreement.
        </p>
      </LegalSection>

      <LegalSection index={4} title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Misuse the service or attempt unauthorized access</li>
          <li>Interfere with other customers’ use of the platform</li>
          <li>Use tracking data unlawfully or outside your rights to that data</li>
          <li>Reverse engineer or resell the service without written permission</li>
        </ul>
        <p>We may suspend accounts that violate these terms.</p>
      </LegalSection>

      <LegalSection index={5} title="Intellectual property">
        <p>
          Quayvox, its branding, and software remain our property (or our licensors’). You
          retain ownership of shipment and customer data you submit.
        </p>
      </LegalSection>

      <LegalSection index={6} title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, we are not liable for indirect or consequential
          damages arising from use of the site or product. Paid plans may include additional terms
          that supersede this summary.
        </p>
      </LegalSection>

      <LegalSection index={7} title="Contact">
        <p>
          Questions about these terms: info@quayvox.com or via the{' '}
          <Link to="/contact">contact page</Link>.
        </p>
      </LegalSection>
    </LegalDoc>
  </>
);

export default Terms;
