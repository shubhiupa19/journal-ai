import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

// Mock fetch globally
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("Home (Cognitive Distortion Analyzer)", () => {
  describe("Initial Render", () => {
    it("renders the page title", () => {
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: /cognitive distortion analyzer/i })
      ).toBeInTheDocument();
    });

    it("renders the description text", () => {
      render(<Home />);
      expect(
        screen.getByText(/identify negative thinking patterns/i)
      ).toBeInTheDocument();
    });

    it("renders a textarea for input", () => {
      render(<Home />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders the Analyze button", () => {
      render(<Home />);
      expect(
        screen.getByRole("button", { name: /analyze/i })
      ).toBeInTheDocument();
    });

    it("does not show results initially", () => {
      render(<Home />);
      expect(screen.queryByText(/analysis results/i)).not.toBeInTheDocument();
    });
  });

  describe("Text Input", () => {
    it("allows user to type in the textarea", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "I am always wrong.");

      expect(textarea).toHaveValue("I am always wrong.");
    });
  });

  describe("Analyze Button", () => {
    it("shows 'Analyzing...' while loading", async () => {
      fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: () => Promise.resolve({ results: [] }),
                }),
              100
            )
          )
      );

      render(<Home />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Test text" } });

      const button = screen.getByRole("button", { name: /analyze/i });
      fireEvent.click(button);

      expect(
        screen.getByRole("button", { name: /analyzing/i })
      ).toBeInTheDocument();
    });

    it("calls the API with the entered text", async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [] }),
      });

      render(<Home />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "I am always wrong." } });

      const button = screen.getByRole("button", { name: /analyze/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "I am always wrong." }),
        });
      });
    });
  });

  describe("Results Display", () => {
    it("shows analysis results after successful API call", async () => {
      fetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: [
              {
                input: "I am always wrong.",
                prediction: "All-or-nothing thinking",
                confidence: 0.85,
              },
            ],
          }),
      });

      render(<Home />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "I am always wrong." } });

      const button = screen.getByRole("button", { name: /analyze/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
      });
    });

    it("displays the analyzed sentence text", async () => {
      fetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: [
              {
                input: "I am always wrong.",
                prediction: "All-or-nothing thinking",
                confidence: 0.85,
              },
            ],
          }),
      });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I am always wrong." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/I am always wrong\./)).toBeInTheDocument();
      });
    });

    it("shows plain text when no distortions are detected", async () => {
      fetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: [
              {
                input: "I had a good day today.",
                prediction: "No Distortion",
                confidence: 0.9,
              },
            ],
          }),
      });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I had a good day today." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/I had a good day today\./i)).toBeInTheDocument();
      });
    });

    it("displays the warning note about model accuracy", async () => {
      fetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: [
              {
                input: "Test",
                prediction: "No Distortion",
                confidence: 0.9,
              },
            ],
          }),
      });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Test" },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/~34% accuracy/i)).toBeInTheDocument();
      });
    });
  });

  describe("Hover Information", () => {
    it("shows distortion info on hover", async () => {
      fetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: [
              {
                input: "I always fail.",
                prediction: "All-or-nothing thinking",
                confidence: 0.85,
              },
            ],
          }),
      });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I always fail." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
      });

      // Select the highlighted span, not the textarea
      const elements = screen.getAllByText(/I always fail\./);
      const highlightedText = elements.find((el) => el.tagName === "SPAN");
      fireEvent.mouseEnter(highlightedText);

      await waitFor(() => {
        expect(screen.getByText(/All-or-nothing thinking/i)).toBeInTheDocument();
        expect(screen.getByText(/85\.0%/)).toBeInTheDocument();
      });
    });
  });

  describe("Feedback", () => {
    const getHighlightedSpan = () => {
      const elements = screen.getAllByText(/I always fail\./);
      return elements.find((el) => el.tagName === "SPAN");
    };

    it("shows feedback options when clicking on a highlighted sentence", async () => {
      fetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: [
              {
                input: "I always fail.",
                prediction: "All-or-nothing thinking",
                confidence: 0.85,
              },
            ],
          }),
      });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I always fail." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
      });

      fireEvent.click(getHighlightedSpan());

      await waitFor(() => {
        expect(screen.getByText(/feedback for/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /correct/i })
        ).toBeInTheDocument();
      });
    });

    it("sends positive feedback when clicking Correct button", async () => {
      fetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              results: [
                {
                  input: "I always fail.",
                  prediction: "All-or-nothing thinking",
                  confidence: 0.85,
                },
              ],
            }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ success: true }),
        });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I always fail." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
      });

      fireEvent.click(getHighlightedSpan());

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /correct/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "I always fail.",
            predicted_distortion: "All-or-nothing thinking",
            user_correction: null,
            is_accepted: true,
            confidence: 0.85,
          }),
        });
      });
    });

    it("shows thank you message after submitting feedback", async () => {
      fetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              results: [
                {
                  input: "I always fail.",
                  prediction: "All-or-nothing thinking",
                  confidence: 0.85,
                },
              ],
            }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ success: true }),
        });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I always fail." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
      });

      fireEvent.click(getHighlightedSpan());

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /correct/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /correct/i }));

      await waitFor(() => {
        expect(screen.getByText(/thanks for your feedback/i)).toBeInTheDocument();
      });
    });

    it("sends correction feedback when selecting from dropdown", async () => {
      fetch
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              results: [
                {
                  input: "I always fail.",
                  prediction: "All-or-nothing thinking",
                  confidence: 0.85,
                },
              ],
            }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ success: true }),
        });

      render(<Home />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "I always fail." },
      });
      fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
      });

      fireEvent.click(getHighlightedSpan());

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const dropdown = screen.getByRole("combobox");
      fireEvent.change(dropdown, { target: { value: "Labeling" } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "I always fail.",
            predicted_distortion: "All-or-nothing thinking",
            user_correction: "Labeling",
            is_accepted: false,
            confidence: 0.85,
          }),
        });
      });
    });
  });
});
