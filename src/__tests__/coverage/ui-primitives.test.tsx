import { render, screen } from "@testing-library/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("ui primitives", () => {
  it("renders badge, button, card, alert, input, label, and checkbox primitives", () => {
    render(
      <div>
        <Badge>Badge</Badge>
        <Button>Save</Button>
        <Card>
          <CardContent>Card body</CardContent>
        </Card>
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Alert body</AlertDescription>
        </Alert>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
        <Checkbox aria-label="Agree" />
      </div>,
    );

    expect(screen.getByText("Badge")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByText("Card body")).toBeInTheDocument();
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Agree")).toBeInTheDocument();
  });
});
