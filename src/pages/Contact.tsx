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
              <a 
                href="mailto:thewayofthedragg@gmail.com" 
                className="text-primary hover:underline"
              >
                thewayofthedragg@gmail.com
              </a>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Telegram</h2>
              <a 
                href="https://t.me/ceo_metaverse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @ceo_metaverse
              </a>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Viber</h2>
              <a 
                href="viber://chat?number=09883249943" 
                className="text-primary hover:underline"
              >
                09883249943
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
