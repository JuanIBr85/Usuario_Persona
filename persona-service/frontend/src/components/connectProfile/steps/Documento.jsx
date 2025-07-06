import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import SimpleSelect from "@/components/SimpleSelect";
import { SelectItem } from "@/components/ui/select";
import { useState } from "react";

export function Documento({ formRef, tipoDocumento, onSubmit, loading }) {
  const [tipoDoc, setTipoDoc] = useState(Object.keys(tipoDocumento)[0] || "");
  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-8">
      <SimpleSelect
        name="tipo_documento"
        label="Tipo de documento"
        placeholder="Selecciona un tipo de documento"
        onValueChange={(value) => setTipoDoc(value)}
        required
      >
        {Object.keys(tipoDocumento).map((tipo) => (
          <SelectItem key={tipo} value={tipo}>
            {tipo}
          </SelectItem>
        ))}
      </SimpleSelect>
      <InputValidate
        id="num_doc_persona"
        name="num_doc_persona"
        type="text"
        value=""
        labelText="Ingresa el número de documento"
        placeholder="Nº de documento"
        validatePattern={tipoDocumento[tipoDoc]}
        containerClassName="sm:col-span-3"
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verificando...' : 'Siguiente'}
      </Button>
    </form>
  );
}