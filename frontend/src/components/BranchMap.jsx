import { useMemo, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

export default function BranchMap({ branches }) {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsKey,
  });

  const validBranches = useMemo(() => {
    return branches.filter((branch) => {
      const lat = Number(branch.latitude);
      const lng = Number(branch.longitude);
      return !Number.isNaN(lat) && !Number.isNaN(lng);
    });
  }, [branches]);

  if (!googleMapsKey) {
    return (
      <p className="muted">
        Add VITE_GOOGLE_MAPS_API_KEY in frontend/.env to show Google Maps.
      </p>
    );
  }

  if (!isLoaded) {
    return <p className="muted">Loading map...</p>;
  }

  if (validBranches.length === 0) {
    return (
      <div className="empty-state">
        No branch has valid latitude and longitude yet.
      </div>
    );
  }

  const center = {
    lat: Number(validBranches[0].latitude),
    lng: Number(validBranches[0].longitude),
  };

  return (
    <>
      <div className="map-box">
        <GoogleMap
          center={center}
          zoom={11}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {validBranches.map((branch) => (
            <Marker
              key={branch._id}
              position={{
                lat: Number(branch.latitude),
                lng: Number(branch.longitude),
              }}
              title={branch.name}
              label={{
                text: branch.name.charAt(0).toUpperCase(),
                color: "white",
                fontWeight: "700",
              }}
              onClick={() => setSelectedBranch(branch)}
            />
          ))}

          {selectedBranch && (
            <InfoWindow
              position={{
                lat: Number(selectedBranch.latitude),
                lng: Number(selectedBranch.longitude),
              }}
              onCloseClick={() => setSelectedBranch(null)}
            >
              <div className="map-info">
                <h3>{selectedBranch.name}</h3>
                <p>{selectedBranch.address}</p>
                <p>
                  <strong>Status:</strong> {selectedBranch.status}
                </p>
                <p>
                  <strong>Capacity:</strong> {selectedBranch.dailyCapacity}
                </p>
                <p>
                  <strong>Waiting:</strong> {selectedBranch.waitingCount || 0}
                </p>
                <p>
                  <strong>Total Tokens:</strong> {selectedBranch.totalTokens || 0}
                </p>
                <p>
                  <strong>Queue Load:</strong> {selectedBranch.loadPercentage || 0}%
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <div className="branch-map-list">
        {validBranches.map((branch) => (
          <button
            key={branch._id}
            className="branch-map-item"
            onClick={() => setSelectedBranch(branch)}
          >
            <strong>{branch.name}</strong>
            <span>{branch.status}</span>
            <small>
              Waiting: {branch.waitingCount || 0} | Load:{" "}
              {branch.loadPercentage || 0}%
            </small>
          </button>
        ))}
      </div>
    </>
  );
}