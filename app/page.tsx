export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-6xl font-bold">
        CreatorForge AI
      </h1>

      <p className="text-xl mt-5 text-gray-300">
        Record once.
        Publish everywhere.
      </p>

      <div className="grid grid-cols-2 gap-8 mt-16">

        <div className="bg-zinc-900 rounded-xl p-8">
          <h2 className="text-2xl font-bold">
            AI Video Editor
          </h2>

          <p className="mt-4">
            Automatically edit, colour grade and enhance every video.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-8">
          <h2 className="text-2xl font-bold">
            AI Shorts Generator
          </h2>

          <p className="mt-4">
            Instantly create TikTok, Shorts and Reels.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-8">
          <h2 className="text-2xl font-bold">
            Analytics
          </h2>

          <p className="mt-4">
            Watch your channel grow in real time.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-8">
          <h2 className="text-2xl font-bold">
            AI Assistant
          </h2>

          <p className="mt-4">
            Ask CreatorForge anything.
          </p>
        </div>

      </div>

    </main>
  );
}
