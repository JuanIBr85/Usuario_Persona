import React, { useEffect, useState } from "react";
import { gatewayService } from "@/services/gatewayService";
import { traducirRateLimitMessage } from "@/utils/traductores";
import ResearchActions from "@/components/endpoint-research/ResearchActions";
import ResearchStatusTable from "@/components/endpoint-research/ResearchStatusTable";
import ServicesList from "@/components/endpoint-research/ServicesList";
import ErrorDialog from "@/components/endpoint-research/ErrorDialog";
import BreadcrumbsNav from "@/components/endpoint-research/BreadcrumbsNav";

function EndpointsResearch() {
  const [status, setStatus] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [researchInterval, setResearchInterval] = useState(1000*30);

  const fetchStatus = async () => {
    try {
      const res = await gatewayService.getResearchStatus();
      setStatus(res);
    } catch (error) {
      const rawMsg = error?.data?.message || error?.message || "Error desconocido.";
      const msg = traducirRateLimitMessage(rawMsg);
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await gatewayService.getAllServices();
      setServices(res?.data || []);
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Error desconocido.";
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  const startResearch = async () => {
    try {
      setLoading(true);
      setResearchInterval(1000*5);
      await gatewayService.startResearch();
      await fetchStatus();
      await fetchServices();
    } catch (error) {
      const rawMsg = error?.data?.message || error?.message || "Error desconocido.";
      const msg = traducirRateLimitMessage(rawMsg);
      setDialogMessage(msg);
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const stopResearch = async () => {
    try {
      setResearchInterval(1000*30);
      await gatewayService.stopResearch();
      await fetchStatus();
    } catch (error) {
      const rawMsg = error?.data?.message || error?.message || "Error desconocido.";
      const msg = traducirRateLimitMessage(rawMsg);
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  const toggleServiceAvailable = async (id, currentState) => {
    try {
      const newState = currentState ? 0 : 1;
      await gatewayService.setServiceAvailable(id, newState);
      setServices((prev) =>
        prev.map((s) =>
          s.id_service === id ? { ...s, service_available: newState } : s
        )
      );
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Error desconocido.";
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  const removeService = async (id) => {
    try {
      await gatewayService.removeService(id);
      setServices((prev) => prev.filter((s) => s.id_service !== id));
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Error desconocido.";
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchServices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
      fetchServices();
    }, researchInterval);

    const timeout = (researchInterval !== 1000*30) ? setTimeout(() => {
      setResearchInterval(1000*30);
    }, 1000*30) : null;

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [researchInterval]);

  return (
    <div className="p-6 space-y-6 py-15 px-3 md:py-10 md:px-15">
      <ResearchActions
        loading={loading}
        onStart={startResearch}
        onStop={stopResearch}
      />

      <ResearchStatusTable status={status} />

      <ServicesList
        services={services}
        onToggleAvailable={toggleServiceAvailable}
        onRemove={removeService}
      />

      <ErrorDialog
        open={openDialog}
        message={dialogMessage}
        onClose={() => setOpenDialog(false)}
      />

      <BreadcrumbsNav />
    </div>
  );
}

export default EndpointsResearch;