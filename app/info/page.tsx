import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, Filter, Users, CheckCircle } from "lucide-react"

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/welcome">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">How It Works</h1>
          <div className="w-16"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">PE Connect Employee Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Find the right team members for your projects by searching through our comprehensive employee database
                using multiple criteria.
              </p>
            </CardContent>
          </Card>

          {/* How it works steps */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Choose Your Search Criteria</h3>
                <p className="text-gray-600">
                  Select from practice areas, regions, experience levels, and specific expertise to narrow down your
                  search.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2. Apply Filters</h3>
                <p className="text-gray-600">
                  Use multiple filters simultaneously to find exactly the expertise you need for your project.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3. Browse Results</h3>
                <p className="text-gray-600">
                  View detailed profiles including project history, roles, and contact information for each team member.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">4. Connect</h3>
                <p className="text-gray-600">
                  Reach out directly to team members or save their information for future project planning.
                </p>
              </div>
            </div>
          </div>

          {/* Search Categories */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Search Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Practice Areas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Healthcare</li>
                    <li>• Education</li>
                    <li>• Commercial</li>
                    <li>• Residential</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Regions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• East</li>
                    <li>• West</li>
                    <li>• Central</li>
                    <li>• International</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Junior (0-3 years)</li>
                    <li>• Mid-level (4-8 years)</li>
                    <li>• Senior (9+ years)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Design</li>
                    <li>• Project Management</li>
                    <li>• Technical</li>
                    <li>• Leadership</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link href="/search">
              <Button size="lg">
                Start Searching Now
                <Search className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
