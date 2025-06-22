import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { componentService } from "@/services/componentService";

function ComponentsAddService() {
  const [formData, setFormData] = useState({
    service_url: "",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ service_url: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const data = await componentService.install_service(formData.service_url);
      setResponse(data);
      /*const res = await fetch(
        "http://localhost:5002/api/control/services/install_service",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ url: formData.service_url }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setResponse({ error: data.message || "Error desconocido" });
      } else {
        setResponse(data);
      }*/
    } catch (error) {
      setResponse(error.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" py-30 px-5 md:py-20 md:px-10 2xl:pl-[5%] 2xl:pr-[5%]">
      <Card className="max-w-lg mx-auto mt-10 p-6 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Instalar Nuevo Servicio
          </CardTitle>
          <CardDescription>
            Agrega la URL del servicio para instalarlo
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <label className="flex flex-col text-sm font-medium text-gray-700">
            URL del servicio
            <input
              type="url"
              name="service_url"
              value={formData.service_url}
              onChange={handleChange}
              required
              placeholder="http://localhost:5001"
              className="mt-1 p-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Instalando..." : "Instalar Servicio"}
          </Button>
        </form>

        {response && (
          <CardContent className="mt-6 bg-gray-100 rounded p-4 text-sm whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default ComponentsAddService;
