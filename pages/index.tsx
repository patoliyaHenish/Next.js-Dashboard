export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tailwind + Next.js + TypeScript</h1>
          <p className="mt-2 text-gray-600">This is a sample page styled with Tailwind CSS.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800">Card One</h2>
              <p className="text-gray-600 text-sm mt-1">Responsive grid with utility classes.</p>
              <button className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Action</button>
            </div>
            <div className="rounded-md border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800">Card Two</h2>
              <p className="text-gray-600 text-sm mt-1">Uses Tailwind for spacing and colors.</p>
              <a href="#" className="mt-3 inline-block text-blue-600 hover:text-blue-700 font-medium">Learn more →</a>
            </div>
          </div>
        </div>
        <footer className="mt-6 text-center text-xs text-gray-500">Edit `pages/index.tsx` to customize.</footer>
      </div>
    </main>
  );
}
