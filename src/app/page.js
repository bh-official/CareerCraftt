import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CareerCraft</h1>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Land Your Dream Job with{" "}
              <span className="text-blue-600">AI-Powered</span> Assistance
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Analyze job descriptions, generate cover letters, prepare for
              interviews, and optimize your resume - all in one place.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700"
              >
                Start Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-gray-100 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Everything You Need to Land Your Next Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Job Analysis</h3>
                <p className="text-gray-600">
                  Analyze how well your resume matches job descriptions with
                  detailed scoring.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-xl font-semibold mb-2">Cover Letters</h3>
                <p className="text-gray-600">
                  Generate personalized cover letters tailored to each job
                  application.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Interview Prep</h3>
                <p className="text-gray-600">
                  Get custom interview questions and tips based on the job
                  you're targeting.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">
                  Resume Optimization
                </h3>
                <p className="text-gray-600">
                  Improve your resume with ATS-friendly suggestions and keyword
                  recommendations.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2">
                  Career Development
                </h3>
                <p className="text-gray-600">
                  Discover certifications and skills to develop for your career
                  growth.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">
                  Application Tracking
                </h3>
                <p className="text-gray-600">
                  Keep track of all your job applications and their match scores
                  in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of job seekers who have accelerated their job
              search with CareerCraft.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-white text-blue-600 text-lg font-medium rounded-lg hover:bg-gray-100"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2024 CareerCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
