"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, User } from "lucide-react"

// Mock data - replace with actual API calls
const mockEmployees = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Senior Healthcare Architect",
    practiceArea: "Healthcare",
    region: "East",
    experience: "Senior (9+ years)",
    expertise: ["Design", "Project Management", "Sustainability"],
    email: "sarah.johnson@pe.com",
    phone: "(555) 123-4567",
    projects: ["Children's Hospital Expansion", "Medical Center Renovation"],
    yearsExperience: 12,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Project Manager",
    practiceArea: "Healthcare",
    region: "East",
    experience: "Mid-level (4-8 years)",
    expertise: ["Project Management", "Technical", "BIM/Technology"],
    email: "michael.chen@pe.com",
    phone: "(555) 234-5678",
    projects: ["Regional Medical Facility", "Urgent Care Centers"],
    yearsExperience: 6,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Healthcare Design Lead",
    practiceArea: "Healthcare",
    region: "East",
    experience: "Senior (9+ years)",
    expertise: ["Design", "Leadership", "Sustainability"],
    email: "emily.rodriguez@pe.com",
    phone: "(555) 345-6789",
    projects: ["Cancer Treatment Center", "Pediatric Wing Design"],
    yearsExperience: 11,
  },
  {
    id: 4,
    name: "David Park",
    role: "Principal Architect",
    practiceArea: "Healthcare",
    region: "East",
    experience: "Principal (15+ years)",
    expertise: ["Leadership", "Design", "Business Development"],
    email: "david.park@pe.com",
    phone: "(555) 456-7890",
    projects: ["Hospital Master Plan", "Medical Campus Development"],
    yearsExperience: 18,
  },
]

export default function ResultsPage() {
  const searchParams = useSearchParams()

  // Convert searchParams to a stable object using useMemo
  const searchCriteria = useMemo(() => {
    const criteria: Record<string, string> = {}
    if (searchParams) {
      searchParams.forEach((value, key) => {
        criteria[key] = value
      })
    }
    return criteria
  }, [searchParams?.toString()])

  // Filter employees based on search criteria using useMemo
  const filteredEmployees = useMemo(() => {
    let filtered = mockEmployees

    if (searchCriteria.q) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchCriteria.q.toLowerCase()) ||
          emp.role.toLowerCase().includes(searchCriteria.q.toLowerCase()) ||
          emp.expertise.some((exp) => exp.toLowerCase().includes(searchCriteria.q.toLowerCase())),
      )
    }

    if (searchCriteria.practice) {
      filtered = filtered.filter((emp) => emp.practiceArea === searchCriteria.practice)
    }

    if (searchCriteria.region) {
      filtered = filtered.filter((emp) => emp.region === searchCriteria.region)
    }

    if (searchCriteria.experience) {
      filtered = filtered.filter((emp) => emp.experience === searchCriteria.experience)
    }

    if (searchCriteria.expertise) {
      const expertiseList = searchCriteria.expertise.split(",")
      filtered = filtered.filter((emp) => expertiseList.some((exp) => emp.expertise.includes(exp)))
    }

    return filtered
  }, [searchCriteria])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Results</h1>
          <div className="w-10"></div>
        </div>

        {/* Search Summary - Mobile Optimized */}
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            {Object.keys(searchCriteria).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(searchCriteria).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key === "q" ? "Search" : key}: {value}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-lg">{filteredEmployees.length}</span> team member
              {filteredEmployees.length !== 1 ? "s" : ""} found
            </p>
          </CardContent>
        </Card>

        {/* Results - Mobile Optimized */}
        <div className="space-y-3">
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4 text-sm">Try adjusting your search criteria</p>
                <Link href="/search">
                  <Button>Modify Search</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredEmployees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${getInitials(employee.name)}`} />
                      <AvatarFallback className="text-sm">{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{employee.name}</h3>
                          <p className="text-gray-600 text-sm">{employee.role}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                          {employee.yearsExperience}y
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 mb-3 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {employee.practiceArea}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {employee.region}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {employee.expertise.slice(0, 3).map((exp) => (
                            <Badge key={exp} variant="secondary" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                          {employee.expertise.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{employee.expertise.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 h-8 text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* New Search Button - Sticky at bottom */}
        <div className="sticky bottom-4 mt-6">
          <Link href="/search">
            <Button variant="outline" size="lg" className="w-full h-12 shadow-lg bg-white">
              Start New Search
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
