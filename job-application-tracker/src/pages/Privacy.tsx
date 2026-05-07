import Layout from '../components/Layout'

export default function Privacy() {
  const effective = 'May 8, 2026'
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-sm mb-6">Effective date: {effective}.</p>

        <section className="mb-5">
          <h2 className="font-medium mb-1">Information we collect</h2>
          <p className="text-sm">We collect information you provide when you create an account or sign in with a third-party provider (for example, your name and email address via Google). We store the job application data you add to the service, including company names, role titles, notes, and application status.</p>
        </section>

        <section className="mb-5">
          <h2 className="font-medium mb-1">How we use information</h2>
          <p className="text-sm">We use your information solely to provide the service — authenticating your account and storing your job applications. We do not sell personal data or use it for advertising.</p>
        </section>

        <section className="mb-5">
          <h2 className="font-medium mb-1">Browser extension</h2>
          <p className="text-sm mb-2">The Jobs Dashboard browser extension is a companion tool for the web app. It operates as follows:</p>
          <ul className="text-sm list-disc list-inside space-y-1">
            <li>When you visit a supported job listing page (Seek, Indeed, LinkedIn), the extension may read the page's content to extract the job title and company name.</li>
            <li>It only reads job detail pages on supported sites — it does not monitor your general browsing history or read other page content.</li>
            <li>Job details you choose to save are sent directly to your Jobs Dashboard account via Supabase. No data is sent to any other party.</li>
            <li>Your authentication token is stored locally in the browser's extension storage (<code>chrome.storage.local</code>) and is used only to authenticate requests to your account.</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="font-medium mb-1">Third-party services</h2>
          <p className="text-sm">We rely on Supabase for database and authentication services, and Google for OAuth sign-in. These providers have their own privacy practices — please review their policies for details on how they handle your data.</p>
        </section>

        <section className="mb-5">
          <h2 className="font-medium mb-1">Data retention and security</h2>
          <p className="text-sm">We retain your data for as long as your account is active or as needed to provide the service. You may delete your account and associated data at any time by contacting us. We implement reasonable security measures but cannot guarantee absolute security.</p>
        </section>

        <section className="mb-5">
          <h2 className="font-medium mb-1">Your rights</h2>
          <p className="text-sm">You may request access, correction, or deletion of your personal data at any time.</p>
        </section>

        <section>
          <h2 className="font-medium mb-1">Contact</h2>
          <p className="text-sm">For privacy questions or data requests, contact: aryanshahnz@gmail.com</p>
        </section>
      </div>
    </Layout>
  )
}
