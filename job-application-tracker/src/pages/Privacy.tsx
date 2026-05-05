import Layout from '../components/Layout'

export default function Privacy() {
  const effective = 'May 5, 2026'
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-sm mb-4">Effective date: {effective}.</p>

        <section className="mb-4">
          <h2 className="font-medium">Information we collect</h2>
          <p className="text-sm">We collect information you provide when you create an account or sign in with a third-party provider (for example, your name and email address via Google). We may also store basic profile information and any content you add to the service.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">How we use information</h2>
          <p className="text-sm">We use your information to provide and improve the service, authenticate your account, and send important notices (for example, email sync suggestions). We do not sell personal data.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Third-party services</h2>
          <p className="text-sm">We rely on third-party providers for authentication and email sync. These providers (for example Google and Supabase) have their own privacy practices. You should review their policies for details about how they handle your data.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Data retention and security</h2>
          <p className="text-sm">We retain personal data as long as necessary to provide the service or as required by law. We implement reasonable security measures to protect your information but cannot guarantee absolute security.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Your rights</h2>
          <p className="text-sm">You may request access, correction, or deletion of your personal data. To do so, contact us at the email below.</p>
        </section>

        <section>
          <h2 className="font-medium">Contact</h2>
          <p className="text-sm">For privacy questions or requests, contact: aryanshahnz@gmail.com</p>
        </section>
      </div>
    </Layout>
  )
}
