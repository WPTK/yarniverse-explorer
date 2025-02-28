
import { useState } from "react";
import { useYarn } from "@/contexts/yarn-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Save, Trash } from "lucide-react";

export function SavedViews() {
  const { savedViews, saveCurrentView, loadSavedView, deleteSavedView } = useYarn();
  const [viewName, setViewName] = useState("");
  
  const handleSave = () => {
    if (viewName.trim()) {
      saveCurrentView(viewName.trim());
      setViewName("");
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };
  
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center text-base">
          <Bookmark className="mr-2 h-4 w-4" />
          Saved Views
        </CardTitle>
        <CardDescription className="text-xs">
          Save filter combinations for quick access
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 px-3">
        <ScrollArea className="h-[140px] pr-2 custom-scrollbar">
          {savedViews.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No saved views yet</p>
              <p className="text-xs mt-1">Save your current filters to access them later</p>
            </div>
          ) : (
            <div className="space-y-1">
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent group"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => loadSavedView(view.id)}>
                    <h4 className="text-xs font-medium">{view.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(view.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSavedView(view.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-1 pb-3 px-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full text-xs h-8">
              <Save className="mr-1 h-3 w-3" />
              Save Current View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Save View</DialogTitle>
              <DialogDescription>
                Give your current filter settings a name to save them for later.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="View name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="mt-2"
            />
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button size="sm" onClick={handleSave} disabled={!viewName.trim()}>
                  Save
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
