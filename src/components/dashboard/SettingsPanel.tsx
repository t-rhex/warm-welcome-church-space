import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SettingsPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage church settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Settings content will go here</p>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;