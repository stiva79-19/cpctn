import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen p-6 sm:p-10 font-sans">
      <h1 className="text-2xl font-semibold mb-2">Sohbetle Tavsiye</h1>
      <p className="text-sm text-gray-600 mb-6">
        Kısaca durumunu anlat; birlikte daha nazik ve uygulanabilir adımlar düşünelim.
      </p>
      <ChatWidget />
    </main>
  );
}
