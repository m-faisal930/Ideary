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
import Link from "next/link";

interface SSGBlogFiltersProps {
  availableTags?: string[];
  currentSearch?: string;
  currentTag?: string;
  currentSort?: string;
  basePath: string;
}

export function SSGBlogFilters({ 
  availableTags = [], 
  currentSearch = "",
  currentTag = "all",
  currentSort = "newest",
  basePath
}: SSGBlogFiltersProps) {
  
  const createFilterURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();
    
    // Keep existing params and apply updates
    const search = updates.search !== undefined ? updates.search : currentSearch;
    const tag = updates.tag !== undefined ? updates.tag : currentTag;
    const sort = updates.sortBy !== undefined ? updates.sortBy : currentSort;
    
    if (search) params.set("search", search);
    if (tag && tag !== "all") params.set("tag", tag);
    if (sort && sort !== "newest") params.set("sortBy", sort);
    
    // Always reset to page 1 when filters change
    params.set("page", "1");
    
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const hasActiveFilters = 
    currentSearch || (currentTag && currentTag !== "all") || currentSort !== "newest";

  return (
    <div className="bg-card border rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h3 className="font-semibold">Filter & Search</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input - Note: This will require client-side handling */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form action={basePath} method="GET" className="w-full">
            <Input
              name="search"
              placeholder="Search blogs..."
              defaultValue={currentSearch}
              className="pl-10"
            />
            {currentTag && currentTag !== "all" && (
              <input type="hidden" name="tag" value={currentTag} />
            )}
            {currentSort !== "newest" && (
              <input type="hidden" name="sortBy" value={currentSort} />
            )}
            <input type="hidden" name="page" value="1" />
          </form>
        </div>

        {/* Tag Filter */}
        <div className="w-full">
          <Select value={currentTag}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <Link href={createFilterURL({ tag: "all" })}>
                <SelectItem value="all">All tags</SelectItem>
              </Link>
              {availableTags.map((tag) => (
                <Link key={tag} href={createFilterURL({ tag })}>
                  <SelectItem value={tag}>
                    {tag}
                  </SelectItem>
                </Link>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="w-full">
          <Select value={currentSort}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full">
              <Link href={createFilterURL({ sortBy: "newest" })}>
                <SelectItem value="newest">Newest first</SelectItem>
              </Link>
              <Link href={createFilterURL({ sortBy: "oldest" })}>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </Link>
              <Link href={createFilterURL({ sortBy: "popular" })}>
                <SelectItem value="popular">Most popular</SelectItem>
              </Link>
              <Link href={createFilterURL({ sortBy: "title" })}>
                <SelectItem value="title">Title A-Z</SelectItem>
              </Link>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm font-medium">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {currentSearch && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &quot;{currentSearch}&quot;
                <Link href={createFilterURL({ search: null })}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Link>
              </Badge>
            )}
            {currentTag && currentTag !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tag: {currentTag}
                <Link href={createFilterURL({ tag: "all" })}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Link>
              </Badge>
            )}
            {currentSort !== "newest" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {currentSort}
                <Link href={createFilterURL({ sortBy: "newest" })}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Link>
              </Badge>
            )}
          </div>
          <Link href={basePath}>
            <Button variant="outline" size="sm">
              Clear all
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}