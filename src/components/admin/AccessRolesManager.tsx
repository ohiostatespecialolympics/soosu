import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PositionsManager from "@/components/admin/PositionsManager";
import UsersAccessManager from "@/components/admin/UsersAccessManager";

interface Props {
  currentUserId: string;
  isAdmin: boolean;
}

export default function AccessRolesManager({ currentUserId, isAdmin }: Props) {
  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          {isAdmin && <TabsTrigger value="admins">Admin access</TabsTrigger>}
        </TabsList>
        <TabsContent value="positions" className="mt-4">
          <PositionsManager />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="admins" className="mt-4">
            <UsersAccessManager currentUserId={currentUserId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
