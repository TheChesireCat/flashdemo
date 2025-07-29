"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { SignUpForm } from "@/components/auth/signup-form"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

type AuthMode = "login" | "signup" | "reset"

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")

  const renderForm = () => {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            onSwitchToSignUp={() => setMode("signup")}
            onSwitchToReset={() => setMode("reset")}
          />
        )
      case "signup":
        return <SignUpForm onSwitchToLogin={() => setMode("login")} />
      case "reset":
        return <ResetPasswordForm onSwitchToLogin={() => setMode("login")} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold">L337Deck</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            SuperMemo-powered flashcards for effective learning
          </p>
        </div>

        {/* Auth Form */}
        {renderForm()}

        {/* Demo Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Try Demo Mode</CardTitle>
            <CardDescription className="text-center">
              Experience the app without creating an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "/"}
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 