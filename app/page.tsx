import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-0 font-sans">
      <div className="hidden sm:block mb-6">
        <h1 className="text-2xl font-semibold mb-2">Sohbetle Tavsiye</h1>
        <p className="text-sm text-gray-600">
          Kısaca durumunu anlat; birlikte daha nazik ve uygulanabilir adımlar düşünelim.
        </p>
      </div>
      <ChatWidget />
    </main>
  );
}
