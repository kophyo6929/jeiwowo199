import { Header } from "@/components/Header";

const Policy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us when using our service.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-3">Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not share your personal information with third parties except as described in this policy.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Policy;
