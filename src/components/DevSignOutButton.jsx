"use client";

export default function DevSignOutButton() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={() =>
          fetch("/api/signout", { method: "POST" }).then(() =>
            window.location.reload(),
          )
        }
        style={{
          padding: "8px 16px",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Sign Out (Dev)
      </button>
    </div>
  );
}
