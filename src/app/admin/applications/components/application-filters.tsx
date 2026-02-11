"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Calendar, Save, RotateCcw } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export interface ApplicationFilters {
  search: string;
  jobId: string;
  status: string;
  dateFrom?: string;
  dateTo?: string;
  hasResume?: string;
  hasNotes?: string;
  experienceLevel?: string;
  sortBy: string;
  sortOrder: string;
}

interface ApplicationFiltersProps {
  filters: ApplicationFilters;
  onFiltersChange: (filters: ApplicationFilters) => void;
  availableJobs: { id: string; title: string }[];
  statusCounts: Record<string, number>;
  isLoading?: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: ApplicationFilters;
  createdAt: Date;
}

const statusOptions = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEWED", label: "Interviewed" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export function ApplicationFilters({
  filters,
  onFiltersChange,
  availableJobs,
  statusCounts,
  isLoading = false,
}: ApplicationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("application-filters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading saved filters:", error);
      }
    }
  }, []);

  useEffect(() => {
    const urlFilters: ApplicationFilters = {
      search: searchParams.get("search") || "",
      jobId: searchParams.get("jobId") || "all",
      status: searchParams.get("status") || "all",
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      hasResume: searchParams.get("hasResume") || undefined,
      hasNotes: searchParams.get("hasNotes") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const hasUrlParams = Array.from(searchParams.keys()).length > 0;
    const filtersChanged =
      hasUrlParams &&
      (urlFilters.search !== filters.search ||
        urlFilters.jobId !== filters.jobId ||
        urlFilters.status !== filters.status ||
        urlFilters.dateFrom !== filters.dateFrom ||
        urlFilters.dateTo !== filters.dateTo ||
        urlFilters.hasResume !== filters.hasResume ||
        urlFilters.hasNotes !== filters.hasNotes ||
        urlFilters.sortBy !== filters.sortBy ||
        urlFilters.sortOrder !== filters.sortOrder);

    if (filtersChanged) {
      setLocalSearch(urlFilters.search);
      onFiltersChange(urlFilters);
    }
  }, [
    searchParams,
    filters.search,
    filters.jobId,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.hasResume,
    filters.hasNotes,
    filters.sortBy,
    filters.sortOrder,
    onFiltersChange,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.jobId !== "all") params.set("jobId", filters.jobId);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.hasResume) params.set("hasResume", filters.hasResume);
      if (filters.hasNotes) params.set("hasNotes", filters.hasNotes);
      if (filters.experienceLevel)
        params.set("experienceLevel", filters.experienceLevel);
      if (filters.sortBy !== "createdAt") params.set("sortBy", filters.sortBy);
      if (filters.sortOrder !== "desc")
        params.set("sortOrder", filters.sortOrder);

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      const currentUrl = window.location.search;

      if (newUrl !== currentUrl) {
        router.replace(`/admin/applications${newUrl}`, { scroll: false });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filters, router]);

  const updateFilter = (key: keyof ApplicationFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    const clearedFilters: ApplicationFilters = {
      search: "",
      jobId: "all",
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
      hasResume: undefined,
      hasNotes: undefined,
      experienceLevel: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setLocalSearch("");
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== "" ||
      filters.jobId !== "all" ||
      filters.status !== "all" ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.hasResume ||
      filters.hasNotes ||
      filters.experienceLevel
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search !== "") count++;
    if (filters.jobId !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.hasResume) count++;
    if (filters.hasNotes) count++;
    if (filters.experienceLevel) count++;
    return count;
  };

  const saveCurrentFilters = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: { ...filters },
      createdAt: new Date(),
    };

    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem("application-filters", JSON.stringify(updatedFilters));
    setFilterName("");
    setShowSaveDialog(false);
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setLocalSearch(savedFilter.filters.search);
    onFiltersChange(savedFilter.filters);
  };

  const deleteSavedFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter((f) => f.id !== filterId);
    setSavedFilters(updatedFilters);
    localStorage.setItem("application-filters", JSON.stringify(updatedFilters));
  };

  const getPresetFilters = () => [
    {
      name: "Recent Applications",
      filters: {
        search: "",
        jobId: "all",
        status: "SUBMITTED",
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        dateTo: undefined,
        hasResume: undefined,
        hasNotes: undefined,
        experienceLevel: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    },
    {
      name: "Under Review",
      filters: {
        search: "",
        jobId: "all",
        status: "UNDER_REVIEW",
        dateFrom: undefined,
        dateTo: undefined,
        hasResume: undefined,
        hasNotes: undefined,
        experienceLevel: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    },
    {
      name: "Shortlisted Candidates",
      filters: {
        search: "",
        jobId: "all",
        status: "SHORTLISTED",
        dateFrom: undefined,
        dateTo: undefined,
        hasResume: undefined,
        hasNotes: undefined,
        experienceLevel: undefined,
        sortBy: "reviewedAt",
        sortOrder: "desc",
      },
    },
    {
      name: "Applications with Resume",
      filters: {
        search: "",
        jobId: "all",
        status: "all",
        dateFrom: undefined,
        dateTo: undefined,
        hasResume: "true",
        hasNotes: undefined,
        experienceLevel: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    },
    {
      name: "Senior Level Candidates",
      filters: {
        search: "",
        jobId: "all",
        status: "all",
        dateFrom: undefined,
        dateTo: undefined,
        hasResume: undefined,
        hasNotes: undefined,
        experienceLevel: "senior",
        sortBy: "experienceYears",
        sortOrder: "desc",
      },
    },
    {
      name: "This Month",
      filters: {
        search: "",
        jobId: "all",
        status: "all",
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        dateTo: undefined,
        hasResume: undefined,
        hasNotes: undefined,
        experienceLevel: undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    },
  ];

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                  <Filter className="h-4 w-4 mr-2" />
                  Presets
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {getPresetFilters().map((preset, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      setLocalSearch(preset.filters.search);
                      onFiltersChange(preset.filters);
                    }}
                  >
                    {preset.name}
                  </DropdownMenuItem>
                ))}
                {savedFilters.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {savedFilters.map((savedFilter) => (
                      <DropdownMenuItem
                        key={savedFilter.id}
                        onClick={() => loadSavedFilter(savedFilter)}
                        className="flex items-center justify-between"
                      >
                        <span>{savedFilter.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedFilter(savedFilter.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters() && (
              <DropdownMenu
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-4">
                  <div className="space-y-3">
                    <Label htmlFor="filter-name">Filter Name</Label>
                    <Input
                      id="filter-name"
                      placeholder="Enter filter name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveCurrentFilters();
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveCurrentFilters}
                        disabled={!filterName.trim()}
                        className="flex-1"
                      >
                        Save Filter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowSaveDialog(false);
                          setFilterName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}

            <Separator orientation="vertical" className="h-6" />

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
          <Label htmlFor="search">Search Applications</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name, email, job title, company, or skills..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
            {localSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setLocalSearch("");
                  updateFilter("search", "");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Search across applicant names, emails, job titles
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                    {statusCounts[status.value] && (
                      <span className="ml-2 text-gray-500">
                        ({statusCounts[status.value]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">Job Position</Label>
            <Select
              value={filters.jobId}
              onValueChange={(value) => updateFilter("jobId", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="job">
                <SelectValue placeholder="All positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {availableJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
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
                <Label htmlFor="dateFrom">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hasResume">Resume Status</Label>
                <Select
                  value={filters.hasResume || "all"}
                  onValueChange={(value) =>
                    updateFilter("hasResume", value === "all" ? "" : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="hasResume">
                    <SelectValue placeholder="All applications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="true">With Resume</SelectItem>
                    <SelectItem value="false">Without Resume</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hasNotes">Review Notes</Label>
                <Select
                  value={filters.hasNotes || "all"}
                  onValueChange={(value) =>
                    updateFilter("hasNotes", value === "all" ? "" : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="hasNotes">
                    <SelectValue placeholder="All applications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="true">With Notes</SelectItem>
                    <SelectItem value="false">Without Notes</SelectItem>
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
                    <SelectItem value="createdAt">Application Date</SelectItem>
                    <SelectItem value="reviewedAt">Last Reviewed</SelectItem>
                    <SelectItem value="firstName">First Name</SelectItem>
                    <SelectItem value="lastName">Last Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="experienceYears">
                      Experience Years
                    </SelectItem>
                    <SelectItem value="expectedSalary">
                      Expected Salary
                    </SelectItem>
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
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
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
              {filters.jobId !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Job:{" "}
                  {availableJobs.find((job) => job.id === filters.jobId)
                    ?.title || filters.jobId}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("jobId", "all")}
                  />
                </Badge>
              )}
              {filters.status !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status:{" "}
                  {statusOptions.find((s) => s.value === filters.status)
                    ?.label || filters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("status", "all")}
                  />
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {filters.dateFrom}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("dateFrom", "")}
                  />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {filters.dateTo}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("dateTo", "")}
                  />
                </Badge>
              )}
              {filters.hasResume && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Resume:{" "}
                  {filters.hasResume === "true" ? "Required" : "Not Required"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("hasResume", "")}
                  />
                </Badge>
              )}
              {filters.hasNotes && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Notes:{" "}
                  {filters.hasNotes === "true" ? "With Notes" : "Without Notes"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("hasNotes", "")}
                  />
                </Badge>
              )}
              {filters.experienceLevel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Experience:{" "}
                  {filters.experienceLevel === "entry"
                    ? "Entry Level"
                    : filters.experienceLevel === "mid"
                    ? "Mid Level"
                    : filters.experienceLevel === "senior"
                    ? "Senior Level"
                    : filters.experienceLevel === "expert"
                    ? "Expert Level"
                    : filters.experienceLevel}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("experienceLevel", "")}
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
