
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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Bookmark className="mr-2 h-5 w-5" />
          Saved Views
        </CardTitle>
        <CardDescription>
          Save and quickly access your filter combinations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[180px] pr-2 custom-scrollbar">
          {savedViews.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No saved views yet</p>
              <p className="text-sm mt-1">Save your current filter settings to access them later</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedViews.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent group"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => loadSavedView(view.id)}>
                    <h4 className="text-sm font-medium">{view.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(view.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSavedView(view.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Current View
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleSave} disabled={!viewName.trim()}>
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
