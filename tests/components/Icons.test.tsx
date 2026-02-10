import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import {
  CheckIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  GripIcon,
} from "../../src/components/Icons";

describe("Icons Components", () => {
  it("renders CheckIcon with default and custom classNames", () => {
    const { rerender, container } = render(<CheckIcon />);
    expect(container.querySelector("svg")).toHaveClass("w-4 h-4");

    rerender(<CheckIcon className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });

  it("renders XIcon with default and custom classNames", () => {
    const { rerender, container } = render(<XIcon />);
    expect(container.querySelector("svg")).toHaveClass("w-4 h-4");

    rerender(<XIcon className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });

  it("renders PencilIcon with default and custom classNames", () => {
    const { rerender, container } = render(<PencilIcon />);
    expect(container.querySelector("svg")).toHaveClass("w-3.5 h-3.5");

    rerender(<PencilIcon className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });

  it("renders TrashIcon with default and custom classNames", () => {
    const { rerender, container } = render(<TrashIcon />);
    expect(container.querySelector("svg")).toHaveClass("w-3.5 h-3.5");

    rerender(<TrashIcon className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });

  it("renders GripIcon with its specific static classes", () => {
    const { container } = render(<GripIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("cursor-grab", "active:cursor-grabbing");
  });
});
