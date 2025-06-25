import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Users, MapPin, Briefcase } from "lucide-react"

// Mock SSO user data - replace with actual SSO integration
const getCurrentUser = () => {
  return {
    name: "Douwe Wieberdink",
    role: "Senior Partner",
    email: "douwe.wieberdink@pe.com",
  }
}

export default function LandingPage() {
  const user = getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">PE Connect</h1>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="max-w-lg mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
          <h3 className="text-2xl font-semibold text-blue-600 mb-6">{user.name}</h3>
          <p className="text-lg text-gray-600 mb-8">
            Find the right expertise for your project. Search our team by practice area, region, and experience level.
          </p>

          <div className="space-y-4">
            <Link href="/search" className="block">
              <Button size="lg" className="w-full h-14 text-lg">
                <Search className="mr-3 h-6 w-6" />
                Start Searching
              </Button>
            </Link>

            <Link href="/info" className="block">
              <Button variant="outline" size="lg" className="w-full h-12">
                How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Features - Mobile Optimized */}
        <div className="space-y-4 max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Regional Search</h3>
              <p className="text-gray-600 text-sm">Find team members by location</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Practice Areas</h3>
              <p className="text-gray-600 text-sm">Search by specialized expertise</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Experience Level</h3>
              <p className="text-gray-600 text-sm">Filter by seniority and expertise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
