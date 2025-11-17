
import React, { useState } from 'react';
import type { ImageFile } from './types';
import ImageUploader from './components/ImageUploader';
import { generateEditedImage } from './services/geminiService';
import { SparklesIcon, DownloadIcon } from './components/icons';

const App: React.FC = () => {
  const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
  const [logoImage, setLogoImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>(
    "Take the first image of the person. Add the logo from the second image onto their t-shirt. Ensure the person's face and features remain completely unchanged. The logo should look like it's naturally printed on the fabric, following the folds of the shirt."
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<{data: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const data = result.split(',')[1];
        resolve({data, mimeType: file.type});
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!baseImage || !logoImage || !prompt) {
      setError('Please provide a base image, a logo image, and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const baseImageBase64 = await fileToBase64(baseImage.file);
      const logoImageBase64 = await fileToBase64(logoImage.file);

      const result = await generateEditedImage({
        baseImage: baseImageBase64,
        logoImage: logoImageBase64,
        prompt: prompt,
      });

      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            Photo Fusion AI
          </h1>
          <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
            Combine images with the power of AI. Upload your photos, describe the edit, and watch the magic happen.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Input Section */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <ImageUploader id="base-image" title="1. Base Image" onImageUpload={setBaseImage} imageFile={baseImage} />
              <ImageUploader id="logo-image" title="2. Logo/Overlay" onImageUpload={setLogoImage} imageFile={logoImage} />
            </div>

            <div>
              <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">
                3. Describe Your Edit
              </label>
              <textarea
                id="prompt"
                rows={5}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
                placeholder="e.g., Add the logo to the person's shirt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !baseImage || !logoImage}
              className="w-full mt-6 py-3 px-6 flex items-center justify-center gap-x-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-6 w-6" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center min-h-[400px] lg:min-h-0">
            <h2 className="text-2xl font-bold text-gray-200 mb-4 w-full text-center">Result</h2>
            {isLoading && (
              <div className="text-center text-gray-400">
                <SparklesIcon className="h-16 w-16 mx-auto animate-pulse text-indigo-400" />
                <p className="mt-4 text-lg">AI is crafting your image...</p>
                <p className="text-sm">This may take a moment.</p>
              </div>
            )}
            {error && (
              <div className="w-full p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                <p className="font-bold">An error occurred</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
            {generatedImage && !isLoading && (
              <div className="w-full aspect-square relative group">
                <img src={generatedImage} alt="Generated result" className="w-full h-full object-contain rounded-lg" />
                <a
                  href={generatedImage}
                  download="generated-image.png"
                  className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-indigo-500 transition-all duration-300 transform hover:scale-110"
                  aria-label="Download image"
                >
                  <DownloadIcon className="h-6 w-6" />
                </a>
              </div>
            )}
            {!generatedImage && !isLoading && !error && (
               <div className="text-center text-gray-500">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="mt-2">Your generated image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
