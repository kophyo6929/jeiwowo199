import { Header } from "@/components/Header";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-4">
            Get in touch with us for any questions or concerns.
          </p>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Email</h2>
              <p className="text-muted-foreground">contact@homietv.com</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
