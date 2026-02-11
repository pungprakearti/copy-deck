import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import Navbar from "../../src/components/Navbar";

describe("Navbar Component", () => {
  const mockOnExport = vi.fn();
  const mockOnImport = vi.fn();

  const defaultProps = {
    onExport: mockOnExport,
    onImport: mockOnImport,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the branding title correctly", () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText(/COPY DECK/i)).toBeInTheDocument();
    });

    it("contains the correct styling classes for branding", () => {
      render(<Navbar {...defaultProps} />);
      const navElement = screen.getByRole("navigation");
      expect(navElement).toHaveClass("font-orbitron-black");
      expect(navElement).toHaveClass("tracking-tighter");
    });

    it("renders Import and Export links", () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText("Import")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
    });

    it("does not show modals initially", () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.queryByText("Export Data")).not.toBeInTheDocument();
      expect(screen.queryByText("Import Data")).not.toBeInTheDocument();
    });
  });

  describe("Export Functionality", () => {
    it("opens export modal when Export link is clicked", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Export"));
      expect(screen.getByText("Export Data")).toBeInTheDocument();
    });

    it("prevents default navigation when Export link is clicked", () => {
      render(<Navbar {...defaultProps} />);
      const exportLink = screen.getByText("Export");
      const event = new MouseEvent("click", { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      exportLink.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("closes export modal when Cancel is clicked", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Export"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Export Data")).not.toBeInTheDocument();
    });

    it("calls onExport and closes modal when Export button is clicked", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Export"));
      const exportButton = screen.getAllByText("Export")[1];
      fireEvent.click(exportButton);
      expect(mockOnExport).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Export Data")).not.toBeInTheDocument();
    });
  });

  describe("Import Functionality", () => {
    it("opens import modal when Import link is clicked", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Import"));
      expect(screen.getByText("Import Data")).toBeInTheDocument();
      expect(screen.getByText(/Select a/i)).toBeInTheDocument();
      expect(screen.getByText(/copyDeckData.json/i)).toBeInTheDocument();
    });

    it("prevents default navigation when Import link is clicked", () => {
      render(<Navbar {...defaultProps} />);
      const importLink = screen.getByText("Import");
      const event = new MouseEvent("click", { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      importLink.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("closes import modal when Cancel is clicked", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Import"));
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Import Data")).not.toBeInTheDocument();
    });

    it("triggers file input click when Choose File button is clicked", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Import"));
      const fileInput = document.querySelector('input[type="file"]');
      const clickSpy = vi.spyOn(fileInput as HTMLElement, "click");
      fireEvent.click(screen.getByText("Choose File"));
      expect(clickSpy).toHaveBeenCalled();
    });

    it("calls onImport and resets file input after successful import", async () => {
      render(<Navbar {...defaultProps} />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = new File(["{}"], "copyDeckData.json", {
        type: "application/json",
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalledWith(file);
        expect(fileInput.value).toBe("");
      });
    });

    it("does nothing when file input changes with no file", () => {
      render(<Navbar {...defaultProps} />);
      fireEvent.click(screen.getByText("Import"));
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });
      expect(mockOnImport).not.toHaveBeenCalled();
      expect(screen.getByText("Import Data")).toBeInTheDocument();
    });
  });

  describe("File Input Attributes", () => {
    it("renders hidden file input correctly", () => {
      render(<Navbar {...defaultProps} />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveClass("hidden");
      expect(fileInput).toHaveAttribute("accept", ".json");
    });
  });
});
