"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Search, Filter, X } from "lucide-react"

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [practiceArea, setPracticeArea] = useState("")
  const [region, setRegion] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])

  const practiceAreas = ["Healthcare", "Education", "Commercial", "Residential", "Mixed-Use", "Hospitality"]
  const regions = ["East", "West", "Central", "International", "Northeast", "Southeast", "Southwest", "Northwest"]
  const expertiseAreas = [
    "Design",
    "Project Management",
    "Technical",
    "Leadership",
    "Business Development",
    "Sustainability",
    "BIM/Technology",
  ]

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    if (checked) {
      setSelectedExpertise([...selectedExpertise, expertise])
    } else {
      setSelectedExpertise(selectedExpertise.filter((e) => e !== expertise))
    }
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (searchTerm) searchParams.set("q", searchTerm)
    if (practiceArea) searchParams.set("practice", practiceArea)
    if (region) searchParams.set("region", region)
    if (selectedExpertise.length > 0) searchParams.set("expertise", selectedExpertise.join(","))

    window.location.href = `/results?${searchParams.toString()}`
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setPracticeArea("")
    setRegion("")
    setSelectedExpertise([])
  }

  const hasActiveFilters = searchTerm || practiceArea || region || selectedExpertise.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Search Team</h1>
          <div className="w-10"></div>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Search Input - Prominent on mobile */}
          <div className="mb-6">
            <Input
              placeholder="Search by name, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Filters Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Practice Area */}
              <div>
                <Label className="text-base font-medium">Practice Area</Label>
                <Select value={practiceArea} onValueChange={setPracticeArea}>
                  <SelectTrigger className="h-12 mt-2">
                    <SelectValue placeholder="Select practice area" />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region */}
              <div>
                <Label className="text-base font-medium">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="h-12 mt-2">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((reg) => (
                      <SelectItem key={reg} value={reg}>
                        {reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expertise Areas */}
              <div>
                <Label className="text-base font-medium mb-3 block">Specific Expertise</Label>
                <div className="space-y-3">
                  {expertiseAreas.map((expertise) => (
                    <div key={expertise} className="flex items-center space-x-3">
                      <Checkbox
                        id={expertise}
                        checked={selectedExpertise.includes(expertise)}
                        onCheckedChange={(checked) => handleExpertiseChange(expertise, checked as boolean)}
                      />
                      <Label htmlFor={expertise} className="text-base font-normal">
                        {expertise}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Button - Fixed at bottom on mobile */}
          <div className="sticky bottom-4">
            <Button onClick={handleSearch} className="w-full h-14 text-lg shadow-lg" size="lg">
              <Search className="mr-3 h-6 w-6" />
              Search Team Members
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
