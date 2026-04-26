import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1163";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125,
};

function BranchMap({ onBranchSelect }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [message, setMessage] = useState("");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/branches`);
        const data = await response.json();

        if (!response.ok) {
          setMessage("Failed to load branches.");
          return;
        }

        setBranches(data);
      } catch (error) {
        console.error(error);
        setMessage("Backend connection failed.");
      }
    };

    fetchBranches();
  }, []);

  const validBranches = useMemo(() => {
    return branches.filter((branch) => {
      const lat = Number(branch.latitude);
      const lng = Number(branch.longitude);

      return !Number.isNaN(lat) && !Number.isNaN(lng);
    });
  }, [branches]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-message">
        Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY in frontend/.env.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="map-message">
        Google Maps failed to load. Check your API key or browser console.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="map-message">Loading Google Map...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {message && <div className="map-message">{message}</div>}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={12}
      >
        {validBranches.map((branch) => {
          const position = {
            lat: Number(branch.latitude),
            lng: Number(branch.longitude),
          };

          return (
            <Marker
              key={branch._id}
              position={position}
              onClick={() => setSelectedBranch(branch)}
            />
          );
        })}

        {selectedBranch && (
          <InfoWindow
            position={{
              lat: Number(selectedBranch.latitude),
              lng: Number(selectedBranch.longitude),
            }}
            onCloseClick={() => setSelectedBranch(null)}
          >
            <div style={{ color: "#111827", maxWidth: "220px" }}>
              <h3 style={{ margin: "0 0 8px" }}>{selectedBranch.name}</h3>
              <p style={{ margin: "0 0 6px" }}>{selectedBranch.address}</p>
              <p style={{ margin: "0 0 6px" }}>
                Status: {selectedBranch.status || "Active"}
              </p>

              <button
                type="button"
                onClick={() => {
                  if (onBranchSelect) {
                    onBranchSelect(selectedBranch);
                  }
                }}
                style={{
                  marginTop: "8px",
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Select Branch
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default BranchMap;