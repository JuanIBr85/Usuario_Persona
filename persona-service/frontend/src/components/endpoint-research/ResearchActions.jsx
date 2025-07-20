import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function ResearchActions({ loading, onStart, onStop }) {
  return (
    <div className="flex gap-4">
      <Button onClick={onStart} disabled={loading} className="cursor-pointer">
        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
        {loading ? "Cargando..." : "Iniciar análisis de los endpoints"}
      </Button>
      <Button variant="secondary" onClick={onStop} className={"cursor-pointer"} >
        Detener análisis
      </Button>
    </div>
  );
}

export default ResearchActions;