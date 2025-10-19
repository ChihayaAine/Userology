import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

function SyncInterviewersButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sync-interviewers?t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Sync Completed",
          description: `Added: ${data.stats.new_added}, Deleted: ${data.stats.deleted}, Total: ${data.stats.current_total}`,
        });
        
        // 刷新页面以显示更新后的数据
        if (data.stats.new_added > 0 || data.stats.deleted > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        toast({
          title: "Sync Failed",
          description: data.error || "Failed to sync interviewers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Error",
        description: "An error occurred while syncing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="p-0 cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 rounded-xl shrink-0 overflow-hidden shadow-md"
      onClick={handleSync}
    >
      <CardContent className="p-0">
        <div className="w-full h-20 overflow-hidden flex justify-center items-center">
          <RefreshCw 
            size={40} 
            className={isLoading ? "animate-spin" : ""}
          />
        </div>
        <p className="my-3 mx-auto text-xs text-wrap w-fit text-center">
          {isLoading ? "Syncing..." : "Sync from Retell"}
        </p>
      </CardContent>
    </Card>
  );
}

export default SyncInterviewersButton;
