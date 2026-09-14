import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SportsManager from "@/components/admin/SportsManager";
import PickupLocationsManager from "@/components/admin/PickupLocationsManager";

export default function ClubSetupManager() {
  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="sports">
        <TabsList>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="pickups">Pickup spots</TabsTrigger>
        </TabsList>
        <TabsContent value="sports" className="mt-4">
          <SportsManager />
        </TabsContent>
        <TabsContent value="pickups" className="mt-4">
          <PickupLocationsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
