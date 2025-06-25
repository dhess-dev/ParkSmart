import { render, screen } from "@testing-library/react";
import Home from "./pages/Home";

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        { id: 1, position: "A1", occupied: true },
        { id: 2, position: "B2", occupied: false },
      ]),
  })
);

test("renders Parking Dashboard with parking spots", async () => {
  render(<Home />);

  const heading = await screen.findByRole("heading", {
      name: /Aktuelle Parkplatzübersicht/i,
  });

    expect(heading).toBeInTheDocument();

  const spotA1 = await screen.findByText("A1");
  expect(spotA1).toBeInTheDocument();

  const spotB2 = await screen.findByText("B2");
  expect(spotB2).toBeInTheDocument();
});
