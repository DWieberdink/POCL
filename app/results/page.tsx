"use client"

import { useMemo, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, User } from "lucide-react"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchCriteria.practice) params.set("practice_area", searchCriteria.practice)
      if (searchCriteria.region) params.set("region", searchCriteria.region)
      // You can add more params as needed
      const res = await fetch(`http://localhost:8000/employees?${params.toString()}`)
      const data = await res.json()
      setEmployees(data)
      setLoading(false)
    }
    fetchEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCriteria.practice, searchCriteria.region])

  // Filter employees based on search criteria using useMemo (for client-side filters like q, expertise, etc.)
  const filteredEmployees = useMemo(() => {
    let filtered = employees
    if (searchCriteria.q) {
      filtered = filtered.filter(
        (emp: any) =>
          (emp.name && emp.name.toLowerCase().includes(searchCriteria.q.toLowerCase())) ||
          (emp.role && emp.role.toLowerCase().includes(searchCriteria.q.toLowerCase())) ||
          (emp.expertise && emp.expertise.some((exp: string) => exp.toLowerCase().includes(searchCriteria.q.toLowerCase())))
      )
    }
    // Add more client-side filters as needed
    return filtered
  }, [employees, searchCriteria])

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
        <div className="max-w-lg mx-auto">
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
            {loading ? (
              <Card><CardContent className="pt-6 pb-6 text-center">Loading...</CardContent></Card>
            ) : filteredEmployees.length === 0 ? (
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
                <Card key={employee.id || employee.emp_id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col space-y-2">
                      <div><strong>Employee ID:</strong> {employee.id}</div>
                      <div><strong>Project:</strong> {employee.project_name} ({employee.project_id})</div>
                      {employee.roles && employee.roles.rows && employee.roles.rows.length > 0 && (
                        <div className="mt-2">
                          {employee.roles.rows.map((role: any, idx: number) => (
                            <div key={idx} className="mb-2">
                              <div><strong>Project Role:</strong> {role.project_role || "N/A"}</div>
                              <div><strong>Project Resume:</strong> {role.project_resume_test || "N/A"}</div>
                            </div>
                          ))}
                        </div>
                      )}
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
    </div>
  )
}
