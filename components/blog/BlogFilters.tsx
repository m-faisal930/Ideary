"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface BlogFiltersProps {
  availableTags?: string[];
}

export function BlogFilters({ availableTags = [] }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedTag, setSelectedTag] = useState(
    searchParams.get("tag") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (selectedTag && selectedTag !== "all") params.set("tag", selectedTag);
    if (sortBy !== "newest") params.set("sortBy", sortBy);

    params.set("page", "1");

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  }, [debouncedSearchTerm, selectedTag, sortBy, router]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("all");
    setSortBy("newest");
    router.push(window.location.pathname);
  };

  const hasActiveFilters =
    searchTerm || (selectedTag && selectedTag !== "all") || sortBy !== "newest";

  return (
    <div className="bg-card border rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h3 className="font-semibold">Filter & Search</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="all">All tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm font-medium">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &quot;{searchTerm}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedTag && selectedTag !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tag: {selectedTag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setSelectedTag("all")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {sortBy !== "newest" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {sortBy}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => setSortBy("newest")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
