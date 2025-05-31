import React from 'react';

function Faq() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes (FAQ)</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">¿Qué es Lorem Ipsum?</h2>
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Cras vulputate
            velit eu leo varius, nec fermentum sapien placerat.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">¿Cómo puedo utilizar Lorem Ipsum?</h2>
          <p className="text-gray-700">
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
            Donec feugiat, lorem eget sollicitudin malesuada, urna orci feugiat neque, vitae aliquet
            nunc justo non lorem.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">¿Por qué se utiliza Lorem Ipsum?</h2>
          <p className="text-gray-700">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">¿Es seguro usar Lorem Ipsum?</h2>
          <p className="text-gray-700">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">¿Dónde puedo conseguir más textos de ejemplo?</h2>
          <p className="text-gray-700">
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
            velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam
            quaerat voluptatem.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Faq;
