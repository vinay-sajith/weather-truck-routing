import "./RouteForm.css";
import { searchLocations } from "../../services/locationService";
import { useState } from "react";

function RouteForm({ onSubmit, loading }) {  
    const [origin, setOrigin] = useState("");
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [destination, setDestination] = useState("");
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  return (
    <section className="route-form-panel">
      <div className="route-form-heading">
        <p className="eyebrow">TRUCK ROUTING</p>
        <h2>Plan your journey</h2>
        <p>Find the safest route for your delivery.</p>
      </div>

      <form
  className="route-form"
  onSubmit={(event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSubmit({
      origin: formData.get("origin"),
      destination: formData.get("destination"),
      departure_time: formData.get("departure_time"),
      load_weight: Number(formData.get("load_weight")),
      interval_miles: Number(formData.get("interval_miles")),
    });
  }}
>
        <label htmlFor="origin">Origin</label>

<div className="location-input-wrapper">
  <input
    id="origin"
    name="origin"
    type="text"
    placeholder="Enter starting location"
    value={origin}
    autoComplete="off"
    onFocus={() => setDestinationSuggestions([])}
    onChange={async (event) => {
      const value = event.target.value;
      setOrigin(value);

      if (value.trim().length < 3) {
        setOriginSuggestions([]);
        return;
      }

      try {
        const suggestions = await searchLocations(value);
        setOriginSuggestions(suggestions);
      } catch (error) {
        console.error("Origin suggestions failed:", error);
        setOriginSuggestions([]);
      }
    }}
    required
  />

  {originSuggestions.length > 0 && (
    <ul className="location-suggestions">
      {originSuggestions.map((location) => (
        <li key={location.id}>

          <button
            type="button"
            onClick={() => {
              setOrigin(location.name);
              setOriginSuggestions([]);
            }}
          >
            {location.name}
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

        <label htmlFor="destination">Destination</label>

<div className="location-input-wrapper">
  <input
    id="destination"
    name="destination"
    type="text"
    placeholder="Enter destination"
    value={destination}
    autoComplete="off"
    onFocus={() => setDestinationSuggestions([])}
    onChange={async (event) => {
      const value = event.target.value;
      setDestination(value);

      if (value.trim().length < 3) {
        setDestinationSuggestions([]);
        return;
      }

      try {
        const suggestions = await searchLocations(value);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error("Destination suggestions failed:", error);
        setDestinationSuggestions([]);
      }
    }}
    required
  />

  {destinationSuggestions.length > 0 && (
    <ul className="location-suggestions">
      {destinationSuggestions.map((location) => (
        <li key={location.id}>
          <button
            type="button"
            onClick={() => {
              setDestination(location.name);
              setDestinationSuggestions([]);
            }}
          >
            {location.name}
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

        <label htmlFor="departure_time">Departure date and time</label>
        <input
          id="departure_time"
          name="departure_time"
          type="datetime-local"
          required
        />

        <label htmlFor="load_weight">Truck load (lb)</label>
        <input
          id="load_weight"
          name="load_weight"
          type="number"
          min="0"
          placeholder="Enter cargo weight"
          required
        />

        <label htmlFor="interval_miles">Weather checkpoint interval</label>
        <select
          id="interval_miles"
          name="interval_miles"
          defaultValue="25"
        >
          <option value="10">Every 10 miles</option>
          <option value="25">Every 25 miles</option>
          <option value="50">Every 50 miles</option>
        </select>

       <button
  type="submit"
  className="analyze-button"
  disabled={loading}
>
  {loading ? "Analyzing..." : "Analyze routes"}
  {!loading && <span aria-hidden="true"> →</span>}
</button>
      </form>
    </section>
  );
}

export default RouteForm;