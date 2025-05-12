export default function VerifySuccessPage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-10 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
          <p className="mb-6">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <a href="/auth" className="text-blue-500 hover:underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }
  