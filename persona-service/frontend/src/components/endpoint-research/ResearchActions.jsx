import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function ResearchActions({ loading, onStart, onStop }) {
  return (
    <div className="flex gap-4">
      <Button onClick={onStart} disabled={loading}>
        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
        {loading ? "Cargando..." : "Iniciar investigación"}
      </Button>
      <Button variant="secondary" onClick={onStop}>
        Detener investigación
      </Button>
    </div>
  );
}

export default ResearchActions;