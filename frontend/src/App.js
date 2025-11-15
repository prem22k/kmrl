import React from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import DocumentsList from './components/DocumentsList';
import Footer from './components/Footer';
import { DocumentProvider } from './context/DocumentContext';

function App() {
  return (
    <DocumentProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        <Header />
        <main className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-fade-in">
              <div className="lg:col-span-4 xl:col-span-3">
                <UploadSection />
              </div>
              <div className="lg:col-span-8 xl:col-span-9">
                <DocumentsList />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
        
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </DocumentProvider>
  );
}

export default App;
