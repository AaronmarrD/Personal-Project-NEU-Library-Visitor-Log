import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert } from "lucide-react";
const NEU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/New_Era_University.svg/250px-New_Era_University.svg.png";

export default function LoginPage() {
  const { loginWithGoogle, blockedMessage } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        {}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
          <BookOpen className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NEU Library</h1>
        <p className="text-gray-500 mt-1 mb-8 text-base">Visitor Log System</p>

        {}
        {blockedMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
              <ShieldAlert className="w-5 h-5" />
              Access Denied
            </div>
            <p className="text-red-600 text-sm">{blockedMessage}</p>
          </div>
        )}

        {}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={loginWithGoogle}
            onError={() => alert("Google Sign-In failed. Please try again.")}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width={320}
            logo_alignment="center"
          />
        </div>

        <div className="border-t border-gray-100 pt-5 mt-2">
          <p className="text-xs text-gray-400">
            Sign in with your <span className="font-medium text-gray-500">@neu.edu.ph</span> Google
            account to log your library visit.
          </p>
        </div>
      </div>
    </div>
  );
}
