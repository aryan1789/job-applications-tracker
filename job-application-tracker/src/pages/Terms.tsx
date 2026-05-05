import Layout from '../components/Layout'

export default function Terms() {
  const effective = 'May 5, 2026'
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Terms of Service</h1>
        <p className="text-sm mb-4">Effective date: {effective}.</p>

        <section className="mb-4">
          <h2 className="font-medium">Acceptance</h2>
          <p className="text-sm">By using this service you agree to these Terms. If you do not agree, do not use the service.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Accounts</h2>
          <p className="text-sm">You are responsible for maintaining the security of your account and for all activity that occurs under your account.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Acceptable use</h2>
          <p className="text-sm">You agree not to misuse the service or attempt to access it in an unauthorized manner.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Third-party services</h2>
          <p className="text-sm">The service integrates with third-party providers (for example, Google and Supabase). Those providers' terms apply when you use their features.</p>
        </section>

        <section className="mb-4">
          <h2 className="font-medium">Limitation of liability</h2>
          <p className="text-sm">To the maximum extent permitted by law, the service is provided "as is" and the maintainers are not liable for indirect or consequential damages.</p>
        </section>

        <section>
          <h2 className="font-medium">Changes</h2>
          <p className="text-sm">We may revise these Terms; updated versions will be posted here with a new effective date.</p>
        </section>

        <section className="mt-4">
          <h2 className="font-medium">Contact</h2>
          <p className="text-sm">Questions about these Terms: aryanshahnz@gmail.com</p>
        </section>
      </div>
    </Layout>
  )
}
