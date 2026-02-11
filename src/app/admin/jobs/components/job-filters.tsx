"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobTypeEnum, ExperienceLevelEnum } from "@/lib/validation/job-schemas";

export interface JobFilters {
  search: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  active: string;
  sortBy: string;
  sortOrder: string;
}

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  departments: string[];
  locations: string[];
  isLoading?: boolean;
}

export function JobFiltersComponent({
  filters,
  onFiltersChange,
  departments,
  locations,
  isLoading = false,
}: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  const updateFilter = (key: keyof JobFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    const clearedFilters: JobFilters = {
      search: "",
      department: "all",
      location: "all",
      type: "all",
      experience: "all",
      active: "all",
      sortBy: "postedDate",
      sortOrder: "desc",
    };
    setLocalSearch("");
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== "" ||
      filters.department !== "all" ||
      filters.location !== "all" ||
      filters.type !== "all" ||
      filters.experience !== "all" ||
      filters.active !== "all"
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search !== "") count++;
    if (filters.department !== "all") count++;
    if (filters.location !== "all") count++;
    if (filters.type !== "all") count++;
    if (filters.experience !== "all") count++;
    if (filters.active !== "all") count++;
    return count;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Jobs</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by title, description, or department..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.active}
              onValueChange={(value) => updateFilter("active", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={filters.department}
              onValueChange={(value) => updateFilter("department", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={filters.location}
              onValueChange={(value) => updateFilter("location", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter("type", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {JobTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={filters.experience}
                  onValueChange={(value) => updateFilter("experience", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {ExperienceLevelEnum.options.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter("sortBy", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postedDate">Posted Date</SelectItem>
                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                    <SelectItem value="title">Job Title</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => updateFilter("sortOrder", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="sortOrder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {hasActiveFilters() && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{filters.search}&quot;
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setLocalSearch("");
                      updateFilter("search", "");
                    }}
                  />
                </Badge>
              )}
              {filters.department !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Dept: {filters.department}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("department", "all")}
                  />
                </Badge>
              )}
              {filters.location !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("location", "all")}
                  />
                </Badge>
              )}
              {filters.type !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filters.type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("type", "all")}
                  />
                </Badge>
              )}
              {filters.experience !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Experience: {filters.experience}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("experience", "all")}
                  />
                </Badge>
              )}
              {filters.active !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.active === "true" ? "Active" : "Inactive"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("active", "all")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
