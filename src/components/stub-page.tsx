import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StubPage({
  title,
  description,
  milestone,
  planned,
}: {
  title: string;
  description: string;
  milestone: string;
  planned: string[];
}) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={title} description={description} />
      <div className="flex flex-1 items-start p-6">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Coming soon
              <Badge variant="secondary">{milestone}</Badge>
            </CardTitle>
            <CardDescription>
              This module is planned and on the roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {planned.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
