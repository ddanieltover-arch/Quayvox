import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';
import ContactForm from '@/components/ContactForm';
import ContactDetailsCard from '@/components/ContactDetailsCard';

const Contact = () => (
  <>
    <PageHero
      eyebrow="CONTACT"
      title="Talk to the Quayvox team."
      description="A global shipping company with branches on every continent. Tell us about your lanes — we’ll follow up."
      image="/images/ops_center_bg.jpg"
      imageAlt="Logistics operations center"
    />

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        <ContactDetailsCard />
        <ContactForm />
      </div>
    </section>

    <PageCta
      title="Exploring the product first?"
      description="See features and plans before you reach out."
      primary={{ label: 'View product', to: '/product' }}
      secondary={{ label: 'Pricing', to: '/pricing' }}
    />
  </>
);

export default Contact;
