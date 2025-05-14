import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the app", () => {
  render(<App />);
  const element = screen.getByText(/Loading/i);
  expect(element).to.not.be.null; 
});