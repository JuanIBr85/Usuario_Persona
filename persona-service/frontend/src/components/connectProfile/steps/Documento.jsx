import InputValidate from "@/components/inputValidate/InputValidate";
import { Button } from "@/components/ui/button";
import SimpleSelect from "@/components/SimpleSelect";
import { SelectItem } from "@/components/ui/select";

export function Documento({ formRef, tipoDocumento, onSubmit, loading }) {
  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-8">
      <SimpleSelect
        name="tipo_documento"
        label="Tipo de documento"
        placeholder="Selecciona un tipo de documento"
        required
      >
        {tipoDocumento.map((tipo) => (
          <SelectItem key={tipo} value={tipo}>
            {tipo}
          </SelectItem>
        ))}
      </SimpleSelect>
      <InputValidate
        id="num_doc_persona"
        name="num_doc_persona"
        type="number"
        value=""
        labelText="Ingresa el número de documento"
        placeholder="Nº de documento"
        containerClassName="sm:col-span-3"
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verificando...' : 'Siguiente'}
      </Button>
    </form>
  );
}
