import RadioPlayerClient from './components/RadioPlayerClient';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">Web Radio App</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Listen to your favorite radio stations</p>
      </header>
      
      <main className="w-full flex-1 flex items-center justify-center">
        <RadioPlayerClient />
      </main>
      
      <footer className="w-full max-w-3xl mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Web Radio App. All rights reserved.</p>
      </footer>
    </div>
  );
}
