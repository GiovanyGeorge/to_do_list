import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

describe("Design System - UI Components", () => {
  it("renders Button correctly and handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables Button when isLoading is true", () => {
    render(<Button isLoading>Submitting</Button>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("renders Card with title and content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Content Body</CardContent>
      </Card>
    );

    expect(screen.getByText("Test Card")).toBeDefined();
    expect(screen.getByText("Content Body")).toBeDefined();
  });

  it("renders PriorityBadge and StatusBadge with expected styles", () => {
    const { rerender } = render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText("Urgent")).toBeDefined();

    rerender(<StatusBadge status="in_progress" />);
    expect(screen.getByText("In Progress")).toBeDefined();
  });

  it("renders Input and Textarea with labels and errors", () => {
    render(
      <div>
        <Input label="Task Name" error="Task name is required" placeholder="Enter title" />
        <Textarea label="Notes" helperText="Add notes" placeholder="Enter notes" />
      </div>
    );

    expect(screen.getByText("Task Name")).toBeDefined();
    expect(screen.getByText("Task name is required")).toBeDefined();
    expect(screen.getByText("Notes")).toBeDefined();
    expect(screen.getByText("Add notes")).toBeDefined();
  });

  it("renders Modal when isOpen is true and closes on close button click", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="My Modal">
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.getByText("My Modal")).toBeDefined();
    expect(screen.getByText("Modal Content")).toBeDefined();

    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
