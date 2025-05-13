export default function VerifyMessagePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-10 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
          <p className="mb-6">
            A verification email has been sent to your email address. Please check your inbox (and your spam/junk folder) for a link to verify your account.
          </p>
          <a href="/" className="text-blue-500 hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    );
  }
  