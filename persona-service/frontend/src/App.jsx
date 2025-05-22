import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "../src/components/ui/form"; // o '@/components/ui/form' si tienes el alias funcionando

import './App.css';

function App() {
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Formulario enviado:", data);
  };

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="border p-2 rounded w-full"
                    placeholder="Ingresa tu nombre"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Enviar
          </button>
        </form>
      </Form>
    </div>
  );
}

export default App;
